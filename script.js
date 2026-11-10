let filters = {
    Brightness: {
        value: 100,
        min: 0,
        max: 200,
        unit: "%",
    },
    Contrast: {
        value: 100,
        min: 0,
        max: 200,
        unit: "%",
    },
    Saturation: {
        value: 100,
        min: 0,
        max: 200,
        unit: "%",
    },
    HueRotation: {
        value: 0,
        min: 0,
        max: 360,
        unit: "deg",
    },
    Blur: {
        value: 0,
        min: 0,
        max: 20,
        unit: "px",
    },
    Grayscale: {
        value: 0,
        min: 0,
        max: 100,
        unit: "%",
    },
    Sepia: {
        value: 0,
        min: 0,
        max: 100,
        unit: "%",
    },
    Opacity: {
        value: 100,
        min: 0,
        max: 100,
        unit: "%",
    },
    Invert: {
        value: 0,
        min: 0,
        max: 100,
        unit: "%",
    }
}
const imageInput = document.querySelector("#image-input");
const imageCanvas = document.querySelector("#image-canvas");
const canvascontext = imageCanvas.getContext("2d");
const resetButton = document.querySelector("#reset-btn");
const DownloadButton = document.querySelector("#download-btn");

const presetsContainer = document.querySelector(".presets");


let file = null;
let image = null;

const filterscontainer = document.querySelector(".filters");
function createFilterElement(name, unit = "%", value, min, max) {
    const div = document.createElement("div");
    div.classList.add("filter");


    const input = document.createElement('input');
    input.type = "range"
    input.min = min
    input.max = max
    input.value = value
    input.id = name


    const p = document.createElement("p");
    p.innerText = name


    div.appendChild(p)
    div.appendChild(input)

    input.addEventListener("input", (event) => {
        filters[name].value = input.value;
        console.log(name, filters[name]);
        applyfilters()

    })
    return div




}

function createfilters() {
    Object.keys(filters).forEach(key => {
        // console.log(filters[filter]);
        // console.log(filters);
        // console.log(key, filters[key]);

        const filterElement = createFilterElement(key, filters[key].unit, filters[key].value, filters[key].min, filters[key].max);


        // console.log(filterElement);

        filterscontainer.appendChild(filterElement)

    })
}

createfilters();


//  Refresh ke baad image gayab nahi hogi

function openImageDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("image-editor-db", 1);

        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains("images")) {
                db.createObjectStore("images");
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function saveImage(file) {
    const db = await openImageDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction("images", "readwrite");
        transaction.objectStore("images").put(file, "saved-image");

        transaction.oncomplete = () => {
            db.close();
            resolve();
        };

        transaction.onerror = () => {
            db.close();
            reject(transaction.error);
        };
    });
}

function showImage(file) {
    const imageUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
        image = img;
        imageCanvas.width = img.width;
        imageCanvas.height = img.height;
        imageCanvas.style.display = "block";
        document.querySelector(".placeholder").style.display = "none";
        applyfilters();
        URL.revokeObjectURL(imageUrl);
    };

    img.onerror = () => {
        URL.revokeObjectURL(imageUrl);
        console.error("Image load nahi ho saki.");
    };

    img.src = imageUrl;
}


//  this code select a folder of image

imageInput.addEventListener("change", async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    showImage(selectedFile);

    try {
        await saveImage(selectedFile);
    } catch (error) {
        console.error("Image save nahi ho saki:", error);
        alert("Image load hui, lekin refresh ke liye save nahi ho saki.");
    }
});





//        this is my code 

// imageInput.addEventListener("change", (event) => {

//     const file = event.target.files[0];
//     if (!file) return;

//     const imageplaceholder = document.querySelector(".placeholder");
//     imageCanvas.style.display = "block";
//     imageplaceholder.style.display = "none";

//     const img = new Image()
//     const imageUrl = URL.createObjectURL(file)
//     img.src = imageUrl

//     img.onload = () => {
//         image = img
//         imageCanvas.width = img.width
//         imageCanvas.height = img.height
//         applyfilters()
//         URL.revokeObjectURL(imageUrl)
//     }



// })

function applyfilters() {
    canvascontext.clearRect(0, 0, imageCanvas.width, imageCanvas.height);

    canvascontext.filter = `
    Brightness(${filters.Brightness.value}${filters.Brightness.unit})
    Contrast(${filters.Contrast.value}${filters.Contrast.unit})
    Saturate(${filters.Saturation.value}${filters.Saturation.unit})
    Hue-Rotate(${filters.HueRotation.value}${filters.HueRotation.unit})
    Blur(${filters.Blur.value}${filters.Blur.unit})
    Grayscale(${filters.Grayscale.value}${filters.Grayscale.unit})
    Sepia(${filters.Sepia.value}${filters.Sepia.unit})
    Opacity(${filters.Opacity.value}${filters.Opacity.unit})
    Invert(${filters.Invert.value}${filters.Invert.unit})
    `.trim()
    canvascontext.drawImage(image, 0, 0);



}


//  ye Imagestor code
async function restoreImage() {
    let db;

    try {
        db = await openImageDB();

        const savedImage = await new Promise((resolve, reject) => {
            const transaction = db.transaction("images", "readonly");
            const request = transaction
                .objectStore("images")
                .get("saved-image");

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });

        if (savedImage) {
            showImage(savedImage);
        }
    } catch (error) {
        console.error("Saved image restore nahi ho saki:", error);
    } finally {
        if (db) db.close();
    }
}

restoreImage();



//  Reset Button code

resetButton.addEventListener("click", () => {
    if (!image) {
        alert("Please choose an image first.");
        return;
    }
    filters = {
        Brightness: {
            value: 100,
            min: 0,
            max: 200,
            unit: "%",
        },
        Contrast: {
            value: 100,
            min: 0,
            max: 200,
            unit: "%",
        },
        Saturation: {
            value: 100,
            min: 0,
            max: 200,
            unit: "%",
        },
        HueRotation: {
            value: 0,
            min: 0,
            max: 360,
            unit: "deg",
        },
        Blur: {
            value: 0,
            min: 0,
            max: 20,
            unit: "px",
        },
        Grayscale: {
            value: 0,
            min: 0,
            max: 100,
            unit: "%",
        },
        Sepia: {
            value: 0,
            min: 0,
            max: 100,
            unit: "%",
        },
        Opacity: {
            value: 100,
            min: 0,
            max: 100,
            unit: "%",
        },
        Invert: {
            value: 0,
            min: 0,
            max: 100,
            unit: "%",
        }
    }
    applyfilters();



    //  all filters reset our position

    filterscontainer.innerHTML = "";
    createfilters();
});


// Download Button code
DownloadButton.addEventListener("click", () => {
    if (!image) {
        alert("Please choose an image first.");
        return;
    }

    const link = document.createElement("a");
    link.download = "Edited-image.png";
    link.href = imageCanvas.toDataURL("image/png");
    link.click();

    alert("Download Image");

})



//     Presets code

const Presets = {
    drama: {
        name: "ड्रामा",
        values: {
            Brightness: 95,
            Contrast: 145,
            Saturation: 125,
            HueRotation: 0,
            Blur: 0,
            Grayscale: 0,
            Sepia: 0,
            Opacity: 100,
            Invert: 0
        }
    },

    vintage: {
        name: "विंटेज",
        values: {
            Brightness: 105,
            Contrast: 110,
            Saturation: 80,
            HueRotation: 8,
            Blur: 0,
            Grayscale: 0,
            Sepia: 35,
            Opacity: 100,
            Invert: 0
        }
    },

    oldSchool: {
        name: "ओल्ड स्कूल",
        values: {
            Brightness: 105,
            Contrast: 115,
            Saturation: 65,
            HueRotation: 0,
            Blur: 0,
            Grayscale: 15,
            Sepia: 45,
            Opacity: 100,
            Invert: 0
        }
    },

    cinematic: {
        name: "सिनेमैटिक",
        values: {
            Brightness: 90,
            Contrast: 130,
            Saturation: 115,
            HueRotation: 345,
            Blur: 0,
            Grayscale: 0,
            Sepia: 10,
            Opacity: 100,
            Invert: 0
        }
    },

    blackAndWhite: {
        name: "ब्लैक एंड व्हाइट",
        values: {
            Brightness: 105,
            Contrast: 125,
            Saturation: 0,
            HueRotation: 0,
            Blur: 0,
            Grayscale: 100,
            Sepia: 0,
            Opacity: 100,
            Invert: 0
        }
    },

    warm: {
        name: "गर्म रंग",
        values: {
            Brightness: 105,
            Contrast: 105,
            Saturation: 120,
            HueRotation: 15,
            Blur: 0,
            Grayscale: 0,
            Sepia: 15,
            Opacity: 100,
            Invert: 0
        }
    },

    soft: {
        name: "सॉफ्ट",
        values: {
            Brightness: 110,
            Contrast: 90,
            Saturation: 95,
            HueRotation: 0,
            Blur: 1,
            Grayscale: 0,
            Sepia: 5,
            Opacity: 100,
            Invert: 0
        }
    },
    cyberpunk: {
        name: "साइबरपंक",
        values: {
            Brightness: 95,
            Contrast: 135,
            Saturation: 155,
            HueRotation: 285,
            Blur: 0,
            Grayscale: 0,
            Sepia: 5,
            Opacity: 100,
            Invert: 0
        }
    },

    softGlow: {
        name: "सॉफ्ट ग्लो",
        values: {
            Brightness: 115,
            Contrast: 85,
            Saturation: 105,
            HueRotation: 0,
            Blur: 2,
            Grayscale: 0,
            Sepia: 8,
            Opacity: 100,
            Invert: 0
        }
    },

    faded: {
        name: "फीका",
        values: {
            Brightness: 110,
            Contrast: 80,
            Saturation: 75,
            HueRotation: 0,
            Blur: 0,
            Grayscale: 5,
            Sepia: 12,
            Opacity: 100,
            Invert: 0
        }
    },

    noir: {
        name: "नॉयर",
        values: {
            Brightness: 90,
            Contrast: 155,
            Saturation: 0,
            HueRotation: 0,
            Blur: 0,
            Grayscale: 100,
            Sepia: 0,
            Opacity: 100,
            Invert: 0
        }
    },

    warmSunset: {
        name: "गर्म सूर्यास्त",
        values: {
            Brightness: 105,
            Contrast: 115,
            Saturation: 135,
            HueRotation: 25,
            Blur: 0,
            Grayscale: 0,
            Sepia: 22,
            Opacity: 100,
            Invert: 0
        }
    },

    coolTone: {
        name: "कूल टोन",
        values: {
            Brightness: 100,
            Contrast: 110,
            Saturation: 95,
            HueRotation: 195,
            Blur: 0,
            Grayscale: 0,
            Sepia: 0,
            Opacity: 100,
            Invert: 0
        }
    },

    retroPop: {
        name: "रेट्रो पॉप",
        values: {
            Brightness: 108,
            Contrast: 125,
            Saturation: 145,
            HueRotation: 335,
            Blur: 0,
            Grayscale: 0,
            Sepia: 18,
            Opacity: 100,
            Invert: 0
        }
    }
};

Object.keys(Presets).forEach(presetsName => {
    const presetsButton = document.createElement("Button");
    presetsButton.classList.add("btn");
    presetsButton.innerHTML = presetsName;
    presetsContainer.appendChild(presetsButton);



    presetsButton.addEventListener("click", () => {
        const preset = Presets[presetsName];

        Object.keys(preset.values).forEach(filterName => {
            filters[filterName].value = preset.values[filterName];


            applyfilters()
            // console.log(preset);

            filterscontainer.innerHTML = "";
            createfilters()

        })
    })
});



//          GPT Undo/Redo Button block  


const topBar = document.querySelector(".left .top");

if (!topBar) {
    console.error("Undo/Redo buttons नहीं बन सके: .left .top नहीं मिला।");
} else {
    const historyButtons = document.createElement("div");
    historyButtons.style.cssText =
        "display:flex;gap:6px;margin-left:auto;flex-shrink:0;";

    const undoButton = document.createElement("button");
    undoButton.type = "button";
    undoButton.className = "btn";
    undoButton.textContent = "Undo";
    undoButton.style.cssText = "padding:5px 9px;font-size:12px;";
    undoButton.disabled = true;

    const redoButton = document.createElement("button");
    redoButton.type = "button";
    redoButton.className = "btn";
    redoButton.textContent = "Redo";
    redoButton.style.cssText = "padding:5px 9px;font-size:12px;";
    redoButton.disabled = true;

    historyButtons.append(undoButton, redoButton);
    topBar.appendChild(historyButtons);

    const originalApplyFilters = applyfilters;
    const undoHistory = [];
    const redoHistory = [];

    let lastFilterState = null;
    let trackedImage = null;
    let historyGroupOpen = false;
    let restoringHistory = false;

    function copyFilters() {
        return JSON.parse(JSON.stringify(filters));
    }

    function updateHistoryButtons() {
        undoButton.disabled = undoHistory.length === 0;
        redoButton.disabled = redoHistory.length === 0;
    }

    function refreshFilterSliders() {
        filterscontainer.innerHTML = "";
        createfilters();
    }

    function restoreFilters(state) {
        restoringHistory = true;
        filters = copyState(state);
        refreshFilterSliders();
        originalApplyFilters();
        lastFilterState = JSON.stringify(filters);
        restoringHistory = false;
        updateHistoryButtons();
    }

    function copyState(state) {
        return JSON.parse(JSON.stringify(state));
    }

    applyfilters = function () {
        if (!image) return;

        if (image !== trackedImage) {
            trackedImage = image;
            undoHistory.length = 0;
            redoHistory.length = 0;
            lastFilterState = JSON.stringify(filters);
            historyGroupOpen = false;
            updateHistoryButtons();
        } else {
            const currentState = JSON.stringify(filters);

            if (
                !restoringHistory &&
                lastFilterState !== null &&
                currentState !== lastFilterState
            ) {
                if (!historyGroupOpen) {
                    undoHistory.push(copyFilters());

                    if (undoHistory.length > 50) {
                        undoHistory.shift();
                    }

                    historyGroupOpen = true;
                    setTimeout(() => {
                        historyGroupOpen = false;
                    }, 0);
                }

                redoHistory.length = 0;
                updateHistoryButtons();
            }

            lastFilterState = currentState;
        }

        originalApplyFilters();
    };

    undoButton.addEventListener("click", () => {
        if (undoHistory.length === 0) return;

        redoHistory.push(copyFilters());
        restoreFilters(undoHistory.pop());
    });

    redoButton.addEventListener("click", () => {
        if (redoHistory.length === 0) return;

        undoHistory.push(copyFilters());
        restoreFilters(redoHistory.pop());
    });
}