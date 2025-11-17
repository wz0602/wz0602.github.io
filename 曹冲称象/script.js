let totalWeight = 0;
let stonesOnBoat = [];
let draggedElement = null;
let stoneCounter = {};
let elephantOnBoat = false;

function initDragAndDrop() {
    const stones = document.querySelectorAll('.stone');
    const daxiang = document.querySelector('.daxiang');
    const boat = document.getElementById('boat');
    const boatStones = document.getElementById('boatStones');
    const resetBtn = document.querySelector('.reset-btn');
    
    stones.forEach(stone => {
        stone.addEventListener('mousedown', startDrag);
        stone.addEventListener('dragstart', e => e.preventDefault());
        stone.addEventListener('touchstart', startTouchDrag, {'passive': false});
    });
    
    if (daxiang) {
        daxiang.addEventListener('mousedown', startDrag);
        daxiang.addEventListener('dragstart', e => e.preventDefault());
        daxiang.addEventListener('touchstart', startTouchDrag, {'passive': false});
    }
    
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchmove', touchDrag, {'passive': false});
    document.addEventListener('touchend', endTouchDrag);
    
    boat.addEventListener('dragover', e => e.preventDefault());
    boatStones.addEventListener('dragover', e => e.preventDefault());
}

function startDrag(event) {
    event.preventDefault();
    draggedElement = event.target.closest('.stone') || 
                    event.target.closest('.stone-on-boat') || 
                    event.target.closest('.daxiang');
    
    if (draggedElement) {
        draggedElement.classList.add('dragging');
        createDragClone();
        updateClonePosition(event);
    }
}

function startTouchDrag(event) {
    event.preventDefault();
    draggedElement = event.target.closest('.stone') || 
                    event.target.closest('.stone-on-boat') || 
                    event.target.closest('.daxiang');
    
    if (draggedElement) {
        draggedElement.classList.add('dragging');
        createDragClone();
        const touch = event.touches[0];
        updateClonePosition(touch);
    }
}

function createDragClone() {
    const clone = draggedElement.cloneNode(true);
    clone.style.position = 'fixed';
    clone.style.pointerEvents = 'none';
    clone.style.zIndex = '1000';
    
    if (draggedElement.classList.contains('daxiang')) {
        clone.style.width = '150px';
        clone.style.height = '112px';
        const img = clone.querySelector('img');
        if (img) {
            img.style.width = '150px';
            img.style.height = '112px';
        }
    } else {
        clone.style.width = '100px';
        clone.style.height = '100px';
        const img = clone.querySelector('img');
        if (img) {
            img.style.width = '100px';
            img.style.height = '100px';
        }
    }
    
    clone.id = 'dragClone';
    document.body.appendChild(clone);
}

function drag(event) {
    if (draggedElement) {
        updateClonePosition(event);
    }
}

function touchDrag(event) {
    if (draggedElement) {
        event.preventDefault();
        const touch = event.touches[0];
        updateClonePosition(touch);
    }
}

function updateClonePosition(event) {
    const clone = document.getElementById('dragClone');
    if (clone) {
        let offsetX = 50;
        let offsetY = 50;
        
        if (draggedElement && draggedElement.classList.contains('daxiang')) {
            offsetX = 75;
            offsetY = 56;
        }
        
        clone.style.left = event.clientX - offsetX + 'px';
        clone.style.top = event.clientY - offsetY + 'px';
    }
}

function endDrag(event) {
    if (draggedElement) {
        const clone = document.getElementById('dragClone');
        if (clone) {
            document.body.removeChild(clone);
        }
        
        checkDropOnBoat(event.clientX, event.clientY);
        draggedElement.classList.remove('dragging');
        draggedElement = null;
    }
}

function endTouchDrag(event) {
    if (draggedElement) {
        const clone = document.getElementById('dragClone');
        if (clone) {
            document.body.removeChild(clone);
        }
        
        const touch = event.changedTouches[0];
        checkDropOnBoat(touch.clientX, touch.clientY);
        draggedElement.classList.remove('dragging');
        draggedElement = null;
    }
}

function checkDropOnBoat(x, y) {
    const boat = document.getElementById('boat');
    const boatRect = boat.getBoundingClientRect();
    const controlPanel = document.querySelector('.control-panel');
    const panelRect = controlPanel.getBoundingClientRect();
    
    // 检查是否拖拽到控制面板区域（移除石头）
    if (x >= panelRect.left && x <= panelRect.right && 
        y >= panelRect.top && y <= panelRect.bottom) {
        if (draggedElement.classList.contains('stone-on-boat')) {
            removeStoneFromBoat(draggedElement);
        }
        return;
    }
    
    // 检查是否拖拽到船上
    if (x >= boatRect.left && x <= boatRect.right && 
        y >= boatRect.top && y <= boatRect.bottom) {
        if (draggedElement.classList.contains('stone')) {
            addStoneToBoat(draggedElement);
        } else if (draggedElement.classList.contains('daxiang')) {
            addElephantToBoat(draggedElement);
        }
    }
}

function addStoneToBoat(stoneElement) {
    const weight = parseInt(stoneElement.dataset.weight);
    const stoneType = stoneElement.dataset.stone;
    
    if (!stoneCounter[stoneType]) {
        stoneCounter[stoneType] = 0;
    }
    stoneCounter[stoneType]++;
    
    const stoneOnBoat = document.createElement('div');
    stoneOnBoat.className = 'stone-on-boat';
    stoneOnBoat.innerHTML = '<img src="st-' + stoneType + '.png" alt="石头' + stoneType + '">';
    stoneOnBoat.dataset.weight = weight;
    stoneOnBoat.dataset.stone = stoneType;
    stoneOnBoat.dataset.id = stoneType + '-' + stoneCounter[stoneType];
    
    stoneOnBoat.addEventListener('click', function() {
        removeStoneFromBoat(this);
    });
    stoneOnBoat.addEventListener('mousedown', startDrag);
    stoneOnBoat.addEventListener('touchstart', startTouchDrag, {'passive': false});
    stoneOnBoat.addEventListener('dragstart', e => e.preventDefault());
    
    document.getElementById('boatStones').appendChild(stoneOnBoat);
    
    stonesOnBoat.push({
        'type': stoneType,
        'weight': weight,
        'element': stoneOnBoat,
        'id': stoneType + '-' + stoneCounter[stoneType]
    });
    
    totalWeight += weight;
    updateDisplay();
}

function removeStoneFromBoat(stoneElement) {
    const weight = parseInt(stoneElement.dataset.weight);
    const id = stoneElement.dataset.id;
    
    stonesOnBoat = stonesOnBoat.filter(stone => stone.id !== id);
    totalWeight -= weight;
    stoneElement.remove();
    updateDisplay();
}

function updateDisplay() {
    const boat = document.getElementById('boat');
    const waterLine = document.getElementById('waterLine');
    const addlineBtn = document.querySelector('.addline-btn');
    
    const targetWeight = 200; // 大象的重量
    const sinkAmount = totalWeight / targetWeight * 45;
    
    boat.style.transform = 'translateY(' + sinkAmount + 'px)';
    
    if (totalWeight >= targetWeight - 10 && totalWeight <= targetWeight + 10) {
        waterLine.style.backgroundColor = '#27ae60';
        waterLine.style.boxShadow = '0 0 10px rgba(39, 174, 96, 0.9)';
        
        // 只有当大象在船上时才显示添加水位线按钮
        if (elephantOnBoat) {
            addlineBtn.style.display = 'block';
        }
    } else {
        waterLine.style.backgroundColor = '#fff';
        waterLine.style.boxShadow = '0 0 5px rgba(231, 76, 60, 0.6)';
        
        // 重量不匹配时隐藏按钮
        addlineBtn.style.display = 'none';
    }
}

function resetBoat() {
    document.getElementById('boatStones').innerHTML = '';
    stonesOnBoat = [];
    totalWeight = 0;
    stoneCounter = {};
    elephantOnBoat = false;
    
    const boat = document.getElementById('boat');
    boat.style.transform = 'translateY(0px)';
    boat.style.transition = 'transform 0.3s ease';
    
    const waterLine = document.getElementById('waterLine');
    waterLine.style.display = 'none';
    
    const elephantOnBoatElement = document.getElementById('daxiangContainer');
    const daxiang = document.querySelector('.daxiang');
    if (elephantOnBoatElement) {
        elephantOnBoatElement.style.display = 'block';
        daxiang.style.display = 'block';
    }
    
    const stonesContainer = document.getElementById('stonesContainer');
    stonesContainer.style.display = 'none';
    
    const addlineBtn = document.querySelector('.addline-btn');
    addlineBtn.style.display = 'none'; // 重置时隐藏按钮
    
    updateDisplay();
}

function addElephantToBoat(elephantElement) {
    if (elephantOnBoat) return;
    
    elephantOnBoat = true;
    const weight = parseInt(elephantElement.dataset.weight);
    elephantElement.style.display = 'none';
    
    const elephantOnBoatElement = document.createElement('div');
    elephantOnBoatElement.className = 'elephant-on-boat';
    elephantOnBoatElement.innerHTML = '<img src="dx.png" alt="大象">';
    elephantOnBoatElement.dataset.weight = weight;
    elephantOnBoatElement.style.cssText = `
                width: 400px !important;
                height: 300px !important;
                position: absolute;
                top: -300px;
                filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3));
        `;
    
    document.getElementById('boatStones').appendChild(elephantOnBoatElement);
    totalWeight += weight;
    updateDisplay();
}

function addLine() {
    const waterLine = document.getElementById('waterLine');
    const addlineBtn = document.querySelector('.addline-btn');
    
    addlineBtn.style.display = 'none';
    waterLine.style.display = 'block';
    waterLine.style.width = '0%';
    waterLine.style.transition = 'width 1s ease-out';
    
    setTimeout(() => {
        waterLine.style.width = '55%';
    }, 50);
    
    setTimeout(() => {
        startElephantFadeAndBoatFloat();
    }, 2000);
}

function startElephantFadeAndBoatFloat() {
    const elephantOnBoatElement = document.querySelector('.elephant-on-boat');
    const boat = document.getElementById('boat');
    const stonesContainer = document.getElementById('stonesContainer');
    const addlineBtn = document.querySelector('.addline-btn');
    const daxiangContainer = document.getElementById('daxiangContainer');
    
    if (daxiangContainer) {
        daxiangContainer.style.display = 'none';
    }
    
    if (elephantOnBoatElement) {
        elephantOnBoatElement.style.transition = 'opacity 2s ease-out';
        elephantOnBoatElement.style.opacity = '0';
        
        setTimeout(() => {
            elephantOnBoatElement.remove();
            elephantOnBoat = false;
            totalWeight -= 200;
            
            boat.style.transition = 'transform 1.5s ease-out';
            boat.style.transform = 'translateY(0px)';
            
            setTimeout(() => {
                stonesContainer.style.display = 'grid';
                stonesContainer.style.opacity = '0';
                stonesContainer.style.transition = 'opacity 1s ease-in';
                
                setTimeout(() => {
                    stonesContainer.style.opacity = '1';
                }, 50);
                
                const waterLine = document.getElementById('waterLine');
                waterLine.style.backgroundColor = '#fff';
            }, 1500);
        }, 2000);
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', function() {
    initDragAndDrop();
    updateDisplay();
});