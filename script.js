const container = document.getElementById("container");
const speedSlider = document.getElementById("speed");
const startBtn = document.getElementById("start");
const pauseBtn = document.getElementById("pause");
const themeToggle = document.getElementById("themeToggle");
const userArrayInput = document.getElementById("userArray");
const algoSelect = document.getElementById("algorithm");

let array = [];
let delay = 100;
let paused = false;
let startTime = 0;
let timerInterval;

// -------------------- Delay --------------------
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

speedSlider.addEventListener("input", () => {
    delay = 210 - speedSlider.value;
});

// -------------------- Sound --------------------
function playSound(freq) {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.type = "sine";
    oscillator.frequency.value = freq;
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1);
}

// -------------------- Timer --------------------
function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(() => {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
        document.getElementById("time").innerText = `Time: ${elapsed}s`;
    }, 100);
}

function stopTimer() {
    clearInterval(timerInterval);
}

// -------------------- Render --------------------
function renderArray() {
    container.innerHTML = "";
    if (array.length === 0) return;

    const maxValue = Math.max(...array);
    const scale = 400 / maxValue; // taller bars

    array.forEach(value => {
        const bar = document.createElement("div");
        bar.classList.add("bar");
        bar.style.height = (value * scale) + "px";
        bar.style.width = Math.max(2, 1000 / array.length) + "px";
        container.appendChild(bar);
    });
}

// -------------------- Pause Check --------------------
async function checkPaused() {
    while (paused) await sleep(50);
}

// -------------------- Sorting Algorithms --------------------

// Bubble Sort
async function bubbleSort() {
    const bars = document.getElementsByClassName("bar");
    const maxValue = Math.max(...array);
    const scale = 400 / maxValue;

    for (let i = 0; i < array.length - 1; i++) {
        for (let j = 0; j < array.length - i - 1; j++) {
            bars[j].classList.add("compare");
            bars[j+1].classList.add("compare");
            await sleep(delay); await checkPaused();
            if (array[j] > array[j+1]) {
                [array[j], array[j+1]] = [array[j+1], array[j]];
                bars[j].style.height = array[j]*scale + "px";
                bars[j+1].style.height = array[j+1]*scale + "px";
                playSound(array[j]*2 + 200);
            }
            bars[j].classList.remove("compare");
            bars[j+1].classList.remove("compare");
        }
    }
}

// Selection Sort
async function selectionSort() {
    const bars = document.getElementsByClassName("bar");
    const maxValue = Math.max(...array);
    const scale = 400 / maxValue;

    for (let i = 0; i < array.length; i++) {
        let minIndex = i;
        bars[minIndex].classList.add("pivot");
        for (let j = i+1; j < array.length; j++) {
            bars[j].classList.add("compare");
            await sleep(delay); await checkPaused();
            if (array[j] < array[minIndex]) minIndex = j;
            bars[j].classList.remove("compare");
        }
        [array[i], array[minIndex]] = [array[minIndex], array[i]];
        bars[i].style.height = array[i]*scale + "px";
        bars[minIndex].style.height = array[minIndex]*scale + "px";
        bars[minIndex].classList.remove("pivot");
        playSound(array[i]*2 + 200);
    }
}

// Insertion Sort
async function insertionSort() {
    const bars = document.getElementsByClassName("bar");
    const maxValue = Math.max(...array);
    const scale = 400 / maxValue;

    for (let i = 1; i < array.length; i++) {
        let key = array[i];
        let j = i-1;
        bars[i].classList.add("pivot");
        while (j >=0 && array[j] > key) {
            await sleep(delay); await checkPaused();
            array[j+1] = array[j];
            bars[j+1].style.height = array[j+1]*scale + "px";
            j--;
            playSound(array[j+1]*2 + 200);
        }
        array[j+1] = key;
        bars[j+1].style.height = key*scale + "px";
        bars[i].classList.remove("pivot");
    }
}

// Merge Sort
async function mergeSort(start=0,end=array.length-1) {
    if (start>=end) return;
    const mid = Math.floor((start+end)/2);
    await mergeSort(start,mid);
    await mergeSort(mid+1,end);
    await merge(start,mid,end);
}
async function merge(start,mid,end) {
    const bars = document.getElementsByClassName("bar");
    const left = array.slice(start,mid+1);
    const right = array.slice(mid+1,end+1);
    let i=0,j=0,k=start;
    const maxValue = Math.max(...array);
    const scale = 400 / maxValue;
    while(i<left.length && j<right.length){
        bars[k].classList.add("compare");
        await sleep(delay); await checkPaused();
        if(left[i]<=right[j]){
            array[k]=left[i];
            bars[k].style.height = left[i]*scale + "px";
            i++;
        }else{
            array[k]=right[j];
            bars[k].style.height = right[j]*scale + "px";
            j++;
        }
        bars[k].classList.remove("compare");
        playSound(array[k]*2 + 200);
        k++;
    }
    while(i<left.length){
        bars[k].classList.add("swap");
        array[k]=left[i];
        bars[k].style.height = left[i]*scale + "px";
        await sleep(delay); await checkPaused();
        bars[k].classList.remove("swap");
        i++; k++;
        playSound(array[k-1]*2 + 200);
    }
    while(j<right.length){
        bars[k].classList.add("swap");
        array[k]=right[j];
        bars[k].style.height = right[j]*scale + "px";
        await sleep(delay); await checkPaused();
        bars[k].classList.remove("swap");
        j++; k++;
        playSound(array[k-1]*2 + 200);
    }
}

// Quick Sort
async function quickSort(start=0,end=array.length-1){
    if(start>=end) return;
    let index = await partition(start,end);
    await quickSort(start,index-1);
    await quickSort(index+1,end);
}
async function partition(start,end){
    const bars = document.getElementsByClassName("bar");
    let pivot = array[end];
    bars[end].classList.add("pivot");
    let i=start-1;
    const maxValue = Math.max(...array);
    const scale = 400 / maxValue;
    for(let j=start;j<end;j++){
        bars[j].classList.add("compare");
        await sleep(delay); await checkPaused();
        if(array[j]<=pivot){
            i++;
            [array[i],array[j]]=[array[j],array[i]];
            bars[i].style.height = array[i]*scale + "px";
            bars[j].style.height = array[j]*scale + "px";
            playSound(array[i]*2 + 200);
        }
        bars[j].classList.remove("compare");
    }
    [array[i+1],array[end]]=[array[end],array[i+1]];
    bars[i+1].style.height = array[i+1]*scale + "px";
    bars[end].style.height = array[end]*scale + "px";
    bars[end].classList.remove("pivot");
    return i+1;
}

// -------------------- Event Listeners --------------------

// Render bars immediately when user enters array
userArrayInput.addEventListener("input", () => {
    const input = userArrayInput.value.trim();
    if (!input) return container.innerHTML = "";
    array = input.split(",").map(x => parseInt(x.trim())).filter(x => !isNaN(x));
    renderArray();
});

startBtn.addEventListener("click", async () => {
    if (array.length === 0) return alert("Please enter a valid array!");
    startTimer();
    paused=false;

    const selected = algoSelect.value;
    if(selected==="Bubble Sort") await bubbleSort();
    else if(selected==="Selection Sort") await selectionSort();
    else if(selected==="Insertion Sort") await insertionSort();
    else if(selected==="Merge Sort") await mergeSort();
    else if(selected==="Quick Sort") await quickSort();

    stopTimer();
    const bars = document.getElementsByClassName("bar");
    for(let bar of bars) bar.classList.add("sorted");
});

pauseBtn.addEventListener("click", ()=>{
    paused=!paused;
});

themeToggle.addEventListener("click", ()=>{
    document.body.classList.toggle("light");
});
