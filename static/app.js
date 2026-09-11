/* =========================================================
   CONFIGURATION
========================================================= */

// Render backend URL
const BACKEND_URL =
    "https://image-enhance-backend.onrender.com";


/* =========================================================
   INTRO PAGE
========================================================= */

const introPage =
    document.getElementById("introPage");

const appPage =
    document.getElementById("appPage");

const nextBtn =
    document.getElementById("nextBtn");


/*
    When the user clicks "Start Enhancing",
    hide the intro page and open the actual application.
*/

if (nextBtn) {

    nextBtn.addEventListener("click", () => {

        introPage.classList.add("hidden");

        appPage.classList.remove("hidden");

        // Start from the top of the application
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    });

}


/* =========================================================
   IMAGE ENHANCEMENT APPLICATION
========================================================= */

const form =
    document.getElementById("uploadForm");

const input =
    document.getElementById("imageInput");

const dropzone =
    document.getElementById("dropzone");

const selectedFile =
    document.getElementById("selectedFile");

const enhanceBtn =
    document.getElementById("enhanceBtn");

const statusBox =
    document.getElementById("status");

const resultSection =
    document.getElementById("resultSection");

const originalPreview =
    document.getElementById("originalPreview");

const enhancedPreview =
    document.getElementById("enhancedPreview");

const originalMeta =
    document.getElementById("originalMeta");

const enhancedMeta =
    document.getElementById("enhancedMeta");

const downloadBtn =
    document.getElementById("downloadBtn");

const timeStat =
    document.getElementById("timeStat");

const sizeStat =
    document.getElementById("sizeStat");


let selected = null;


/* =========================================================
   STATUS MESSAGE
========================================================= */

function showStatus(message, type = "") {

    statusBox.textContent = message;

    statusBox.className =
        `status ${type}`;

    statusBox.classList.remove("hidden");

}


/* =========================================================
   FILE SELECTION
========================================================= */

function chooseFile(file) {

    if (!file) return;

    selected = file;


    /*
        Show selected filename
    */

    selectedFile.textContent =
        `Selected: ${file.name} • ${(file.size / 1024 / 1024).toFixed(2)} MB`;

    selectedFile.classList.remove("hidden");


    /*
        Enable enhancement button
    */

    enhanceBtn.disabled = false;


    /*
        Preview original image
    */

    const reader =
        new FileReader();

    reader.onload = e => {

        originalPreview.src =
            e.target.result;

    };

    reader.readAsDataURL(file);

}


/* =========================================================
   NORMAL FILE INPUT
========================================================= */

if (input) {

    input.addEventListener("change", () => {

        chooseFile(
            input.files[0]
        );

    });

}


/* =========================================================
   DRAG ENTER / DRAG OVER
========================================================= */

if (dropzone) {

    ["dragenter", "dragover"].forEach(eventName => {

        dropzone.addEventListener(
            eventName,
            e => {

                e.preventDefault();

                e.stopPropagation();

                dropzone.classList.add(
                    "dragging"
                );

            }
        );

    });


    /* =====================================================
       DRAG LEAVE / DROP
    ===================================================== */

    ["dragleave", "drop"].forEach(eventName => {

        dropzone.addEventListener(
            eventName,
            e => {

                e.preventDefault();

                e.stopPropagation();

                dropzone.classList.remove(
                    "dragging"
                );

            }
        );

    });


    /* =====================================================
       DROP IMAGE
    ===================================================== */

    dropzone.addEventListener(
        "drop",
        e => {

            const files =
                e.dataTransfer.files;

            if (files && files.length > 0) {

                chooseFile(files[0]);

            }

        }
    );

}


/* =========================================================
   ENHANCE IMAGE
========================================================= */

if (form) {

    form.addEventListener(
        "submit",
        async e => {

            e.preventDefault();

            if (!selected) {

                showStatus(
                    "Please choose an image first.",
                    "error"
                );

                return;

            }


            /*
                Disable button while processing
            */

            enhanceBtn.disabled = true;

            enhanceBtn.textContent =
                "Enhancing…";


            /*
                Hide previous result
            */

            resultSection.classList.add(
                "hidden"
            );


            /*
                Show processing status
            */

            showStatus(
                "Connecting to Real-ESRGAN server…"
            );


            /*
                Create form data
            */

            const data =
                new FormData();

            data.append(
                "image",
                selected
            );


            try {

                /*
                    Send image to Render backend

                    IMPORTANT:
                    The frontend is hosted on Vercel,
                    so we cannot use "/enhance".
                */

                showStatus(
                    "Running Real-ESRGAN ×4. Please wait…"
                );


                const response =
                    await fetch(
                        `${BACKEND_URL}/enhance`,
                        {
                            method: "POST",
                            body: data
                        }
                    );


                /*
                    Try to read JSON response
                */

                let result;

                try {

                    result =
                        await response.json();

                } catch {

                    throw new Error(
                        "The backend returned an invalid response."
                    );

                }


                /*
                    Handle backend errors
                */

                if (!response.ok) {

                    throw new Error(
                        result.error ||
                        "Enhancement failed."
                    );

                }


                /*
                    Make sure enhancement succeeded
                */

                if (!result.success) {

                    throw new Error(
                        result.error ||
                        "Enhancement failed."
                    );

                }


                /*
                    Prevent browser caching
                */

                const cacheBust =
                    `?t=${Date.now()}`;


                /*
                    Enhanced image

                    Backend returns the complete
                    Render download URL.
                */

                enhancedPreview.src =
                    result.download_url +
                    cacheBust;


                /*
                    Download button
                */

                downloadBtn.href =
                    result.download_url;

                downloadBtn.setAttribute(
                    "download",
                    "enhanced_x4.png"
                );


                /*
                    Original dimensions
                */

                originalMeta.textContent =
                    `${result.input_width} × ${result.input_height}px`;


                /*
                    Enhanced dimensions
                */

                enhancedMeta.textContent =
                    `${result.output_width} × ${result.output_height}px`;


                /*
                    Inference time
                */

                timeStat.textContent =
                    `${result.time_seconds}s`;


                /*
                    Output dimensions
                */

                sizeStat.textContent =
                    `${result.output_width} × ${result.output_height}`;


                /*
                    Show results
                */

                resultSection.classList.remove(
                    "hidden"
                );


                /*
                    Success message
                */

                showStatus(
                    "Image enhanced successfully.",
                    "success"
                );


                /*
                    Scroll to result
                */

                resultSection.scrollIntoView({
                    behavior: "smooth"
                });

            }


            catch (error) {

                console.error(
                    "Enhancement error:",
                    error
                );


                /*
                    Display error
                */

                showStatus(
                    error.message ||
                    "Something went wrong while enhancing the image.",
                    "error"
                );

            }


            finally {

                /*
                    Restore button
                */

                enhanceBtn.disabled = false;

                enhanceBtn.textContent =
                    "Enhance Image ×4";

            }

        }
    );

}