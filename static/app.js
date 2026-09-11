/* =========================================================
   CONFIGURATION
========================================================= */

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


if (nextBtn) {

    nextBtn.addEventListener("click", () => {

        introPage.classList.add("hidden");

        appPage.classList.remove("hidden");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    });

}


/* =========================================================
   ELEMENTS
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
   STATUS
========================================================= */

function showStatus(message, type = "") {

    if (!statusBox) return;

    statusBox.textContent = message;

    statusBox.className =
        `status ${type}`;

    statusBox.classList.remove("hidden");

}


/* =========================================================
   FILE VALIDATION
========================================================= */

function isValidImage(file) {

    if (!file) {
        return false;
    }

    const allowedTypes = [
        "image/png",
        "image/jpeg",
        "image/webp",
        "image/bmp"
    ];

    return allowedTypes.includes(file.type);

}


/* =========================================================
   CHOOSE FILE
========================================================= */

function chooseFile(file) {

    if (!file) {
        return;
    }


    if (!isValidImage(file)) {

        showStatus(
            "Please select a PNG, JPG, JPEG, WEBP or BMP image.",
            "error"
        );

        return;
    }


    const maxSize =
        20 * 1024 * 1024;


    if (file.size > maxSize) {

        showStatus(
            "Image is too large. Maximum size is 20 MB.",
            "error"
        );

        return;
    }


    selected = file;


    selectedFile.textContent =
        `Selected: ${file.name} • ${(file.size / 1024 / 1024).toFixed(2)} MB`;

    selectedFile.classList.remove("hidden");


    enhanceBtn.disabled = false;


    const reader =
        new FileReader();


    reader.onload = event => {

        originalPreview.src =
            event.target.result;

        originalPreview.style.display =
            "block";

    };


    reader.readAsDataURL(file);


    showStatus(
        "Image ready. Click Enhance Image ×4.",
        ""
    );

}


/* =========================================================
   FILE INPUT
========================================================= */

if (input) {

    input.addEventListener(
        "change",
        () => {

            chooseFile(
                input.files[0]
            );

        }
    );

}


/* =========================================================
   DRAG AND DROP
========================================================= */

if (dropzone) {


    ["dragenter", "dragover"].forEach(
        eventName => {

            dropzone.addEventListener(
                eventName,
                event => {

                    event.preventDefault();

                    event.stopPropagation();

                    dropzone.classList.add(
                        "dragging"
                    );

                }
            );

        }
    );


    ["dragleave", "drop"].forEach(
        eventName => {

            dropzone.addEventListener(
                eventName,
                event => {

                    event.preventDefault();

                    event.stopPropagation();

                    dropzone.classList.remove(
                        "dragging"
                    );

                }
            );

        }
    );


    dropzone.addEventListener(
        "drop",
        event => {

            const files =
                event.dataTransfer.files;


            if (
                files &&
                files.length > 0
            ) {

                chooseFile(
                    files[0]
                );

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
        async event => {

            event.preventDefault();


            if (!selected) {

                showStatus(
                    "Please choose an image first.",
                    "error"
                );

                return;
            }


            enhanceBtn.disabled =
                true;

            enhanceBtn.textContent =
                "Enhancing…";


            resultSection.classList.add(
                "hidden"
            );


            showStatus(
                "Connecting to Real-ESRGAN server…"
            );


            const data =
                new FormData();


            data.append(
                "image",
                selected
            );


            try {


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


                let result;


                try {

                    result =
                        await response.json();

                } catch {

                    throw new Error(
                        "The backend returned an invalid response."
                    );

                }


                if (!response.ok) {

                    throw new Error(
                        result.error ||
                        "Enhancement failed."
                    );

                }


                if (!result.success) {

                    throw new Error(
                        result.error ||
                        "Enhancement failed."
                    );

                }


                /* =================================================
                   RESULT URL
                ================================================= */

                const imageUrl =
                    result.download_url;


                const cacheBust =
                    `?t=${Date.now()}`;


                enhancedPreview.src =
                    imageUrl +
                    cacheBust;


                downloadBtn.href =
                    imageUrl;


                downloadBtn.setAttribute(
                    "download",
                    "enhanced_x4.png"
                );


                /* =================================================
                   DIMENSIONS
                ================================================= */

                originalMeta.textContent =
                    `${result.input_width} × ${result.input_height}px`;


                enhancedMeta.textContent =
                    `${result.output_width} × ${result.output_height}px`;


                /* =================================================
                   STATS
                ================================================= */

                timeStat.textContent =
                    `${result.time_seconds}s`;


                sizeStat.textContent =
                    `${result.output_width} × ${result.output_height}`;


                /* =================================================
                   SHOW RESULT
                ================================================= */

                resultSection.classList.remove(
                    "hidden"
                );


                showStatus(
                    "Image enhanced successfully.",
                    "success"
                );


                resultSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }


            catch (error) {

                console.error(
                    "Enhancement error:",
                    error
                );


                showStatus(
                    error.message ||
                    "Something went wrong while enhancing the image.",
                    "error"
                );

            }


            finally {

                enhanceBtn.disabled =
                    false;

                enhanceBtn.textContent =
                    "Enhance Image ×4";

            }

        }
    );

}