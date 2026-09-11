/* =========================================================
   INTRO PAGE
========================================================= */

const introPage = document.getElementById("introPage");
const appPage = document.getElementById("appPage");
const nextBtn = document.getElementById("nextBtn");


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

const form = document.getElementById("uploadForm");

const input = document.getElementById("imageInput");

const dropzone = document.getElementById("dropzone");

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

    const reader = new FileReader();

    reader.onload = e => {

        originalPreview.src =
            e.target.result;

    };

    reader.readAsDataURL(file);

}


/* =========================================================
   NORMAL FILE INPUT
========================================================= */

input.addEventListener("change", () => {

    chooseFile(input.files[0]);

});


/* =========================================================
   DRAG ENTER / DRAG OVER
========================================================= */

["dragenter", "dragover"].forEach(eventName => {

    dropzone.addEventListener(
        eventName,
        e => {

            e.preventDefault();

            dropzone.classList.add("dragging");

        }
    );

});


/* =========================================================
   DRAG LEAVE / DROP
========================================================= */

["dragleave", "drop"].forEach(eventName => {

    dropzone.addEventListener(
        eventName,
        e => {

            e.preventDefault();

            dropzone.classList.remove("dragging");

        }
    );

});


/* =========================================================
   DROP IMAGE
========================================================= */

dropzone.addEventListener("drop", e => {

    chooseFile(
        e.dataTransfer.files[0]
    );

});


/* =========================================================
   ENHANCE IMAGE
========================================================= */

form.addEventListener(
    "submit",
    async e => {

        e.preventDefault();

        if (!selected) return;


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
            "Running Real-ESRGAN ×4. This may take a few seconds…"
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
                Send image to Flask backend
            */

            const response =
                await fetch(
                    "/enhance",
                    {
                        method: "POST",
                        body: data
                    }
                );


            /*
                Read JSON response
            */

            const result =
                await response.json();


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
                Prevent browser caching
            */

            const cacheBust =
                `?t=${Date.now()}`;


            /*
                Enhanced image
            */

            enhancedPreview.src =
                result.download_url +
                cacheBust;


            /*
                Download button
            */

            downloadBtn.href =
                result.download_url;


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

            /*
                Display error
            */

            showStatus(
                error.message,
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