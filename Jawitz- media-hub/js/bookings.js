
/* ==========================================================
   JAWITZ MEDIA HUB
   BOOKING SYSTEM
   Jawitz Properties Centurion
   ========================================================== */

"use strict";

/* ==========================================================
   CONFIGURATION
   ========================================================== */

const BOOKING_CONFIG = {
    endpoint: "https://formspree.io/f/xljgqyob",

    services: {
        insta360: "Insta360 X5 Camera",
        photography: "Property Photography",
        video: "Video Production & Editing",
        training: "Media Training"
    }
};

/* ==========================================================
   INITIALISE BOOKING SYSTEM
   ========================================================== */

document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("booking-form");

    if (!form) {
        console.warn("Jawitz booking form not found.");
        return;
    }

    const submitButton = document.getElementById("booking-submit");
    const statusMessage = document.getElementById("booking-form-status");
    const dateInput = document.getElementById("booking-date");
    const termsCheckbox = document.getElementById("booking-terms");
    const equipmentCheckbox = document.getElementById(
        "booking-equipment-terms"
    );
    const equipmentAcknowledgement = document.getElementById(
        "insta360-acknowledgement"
    );

    const serviceInputs = document.querySelectorAll(
        'input[name="service"]'
    );

    let isSubmitting = false;

    /* ======================================================
       HELPER FUNCTIONS
       ====================================================== */

    function getFieldValue(name) {
        const field = form.elements.namedItem(name);

        if (!field) {
            return "";
        }

        return String(field.value || "").trim();
    }

    function getSelectedService() {
        const selected = document.querySelector(
            'input[name="service"]:checked'
        );

        return selected ? selected.value : "";
    }

    function getServiceLabel(service) {
        return BOOKING_CONFIG.services[service] || service;
    }

    function getTodayLocal() {
        const now = new Date();

        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    /* ======================================================
       STATUS MESSAGES
       ====================================================== */

    function showStatus(message, type = "info") {
        if (!statusMessage) {
            return;
        }

        statusMessage.textContent = message;
        statusMessage.dataset.status = type;

        statusMessage.style.marginTop = "18px";
        statusMessage.style.padding = "16px 18px";
        statusMessage.style.borderRadius = "8px";
        statusMessage.style.lineHeight = "1.6";
        statusMessage.style.fontWeight = "500";

        if (type === "success") {
            statusMessage.style.backgroundColor = "#eaf6ee";
            statusMessage.style.color = "#17663b";
            statusMessage.style.border = "1px solid #b8dfc4";

        } else if (type === "error") {
            statusMessage.style.backgroundColor = "#fff0ef";
            statusMessage.style.color = "#a32828";
            statusMessage.style.border = "1px solid #f0c2bd";

        } else {
            statusMessage.style.backgroundColor = "#f5f3ef";
            statusMessage.style.color = "#4d463d";
            statusMessage.style.border = "1px solid #e5dfd4";
        }
    }

    function clearStatus() {
        if (!statusMessage) {
            return;
        }

        statusMessage.textContent = "";
        statusMessage.removeAttribute("data-status");
        statusMessage.removeAttribute("style");
    }

    /* ======================================================
       SUBMIT BUTTON
       ====================================================== */

    function setSubmitting(submitting) {
        isSubmitting = submitting;

        if (!submitButton) {
            return;
        }

        submitButton.disabled = submitting;
        submitButton.setAttribute("aria-busy", String(submitting));

        const buttonLabel = submitButton.querySelector("span");

        if (buttonLabel) {
            buttonLabel.textContent = submitting
                ? "SENDING BOOKING REQUEST..."
                : "SUBMIT BOOKING REQUEST";
        }
    }

    /* ======================================================
       DATE VALIDATION
       ====================================================== */

    function updateMinimumDate() {
        if (!dateInput) {
            return;
        }

        dateInput.min = getTodayLocal();
    }

    function validateBookingDate() {
        if (!dateInput) {
            return true;
        }

        const selectedDate = dateInput.value;

        dateInput.setCustomValidity("");

        if (!selectedDate) {
            dateInput.setCustomValidity(
                "Please select your preferred booking date."
            );
            dateInput.reportValidity();
            return false;
        }

        if (selectedDate < getTodayLocal()) {
            dateInput.setCustomValidity(
                "Please select today or a future date."
            );
            dateInput.reportValidity();
            return false;
        }

        return true;
    }

    updateMinimumDate();

    if (dateInput) {
        dateInput.addEventListener("change", function () {
            dateInput.setCustomValidity("");
            validateBookingDate();
        });
    }

    /* ======================================================
       SERVICE SELECTION
       ====================================================== */

    function updateServiceSelection() {
        const selectedService = getSelectedService();

        const cards = document.querySelectorAll(
            ".booking-service-card"
        );

        cards.forEach(function (card) {
            const radio = card.querySelector(
                'input[name="service"]'
            );

            const selected = Boolean(radio && radio.checked);

            card.classList.toggle("selected", selected);
            card.classList.toggle("is-selected", selected);
        });

        const isInsta360 = selectedService === "insta360";

        if (equipmentAcknowledgement) {
            equipmentAcknowledgement.hidden = !isInsta360;
        }

        if (equipmentCheckbox) {
            equipmentCheckbox.required = isInsta360;

            if (!isInsta360) {
                equipmentCheckbox.checked = false;
            }
        }
    }

    serviceInputs.forEach(function (input) {
        input.addEventListener("change", function () {
            updateServiceSelection();
            clearStatus();
        });
    });

    /* ======================================================
       PRESELECT SERVICE FROM URL
       ====================================================== */

    function preselectServiceFromURL() {
        const params = new URLSearchParams(
            window.location.search
        );

        const requestedService = (
            params.get("service") || ""
        ).toLowerCase();

        const hash = window.location.hash
            .replace("#", "")
            .toLowerCase();

        let serviceToSelect = requestedService;

        if (!serviceToSelect) {
            if (hash === "insta360") {
                serviceToSelect = "insta360";
            } else if (hash === "photography") {
                serviceToSelect = "photography";
            } else if (hash === "video") {
                serviceToSelect = "video";
            } else if (hash === "training") {
                serviceToSelect = "training";
            }
        }

        if (!serviceToSelect) {
            return;
        }

        const matchingRadio = Array.from(
            serviceInputs
        ).find(function (radio) {
            return radio.value === serviceToSelect;
        });

        if (matchingRadio) {
            matchingRadio.checked = true;
        }
    }

    preselectServiceFromURL();
    updateServiceSelection();

    /* ======================================================
       BOOKING VALIDATION
       ====================================================== */

    function validateBooking() {
        const service = getSelectedService();

        if (!service) {
            showStatus(
                "Please select a service before submitting your booking.",
                "error"
            );

            document.getElementById(
                "service-selection"
            )?.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

            return false;
        }

        if (!validateBookingDate()) {
            showStatus(
                "Please select a valid preferred booking date.",
                "error"
            );
            return false;
        }

        if (!form.checkValidity()) {
            form.reportValidity();
            return false;
        }

        if (termsCheckbox && !termsCheckbox.checked) {
            showStatus(
                "Please accept the Terms & Conditions.",
                "error"
            );
            termsCheckbox.focus();
            return false;
        }

        if (
            service === "insta360" &&
            equipmentCheckbox &&
            !equipmentCheckbox.checked
        ) {
            showStatus(
                "Please acknowledge the Insta360 X5 equipment terms.",
                "error"
            );
            equipmentCheckbox.focus();
            return false;
        }

        return true;
    }

    /* ======================================================
       COLLECT BOOKING DETAILS
       ====================================================== */

    function buildBookingPayload() {
        const selectedService = getSelectedService();

        return {
            _subject:
                "Jawitz Media Hub Booking Request - " +
                getServiceLabel(selectedService),

            service: getServiceLabel(selectedService),

            agent_name: getFieldValue("full_name"),

            centurion_area: getFieldValue("centurion_area"),

            email: getFieldValue("email"),

            phone: getFieldValue("phone"),

            preferred_date: getFieldValue("preferred_date"),

            preferred_time: getFieldValue("preferred_time"),

            property_address: getFieldValue("property_address"),

            additional_information: getFieldValue(
                "additional_information"
            ),

            terms_accepted:
                termsCheckbox && termsCheckbox.checked
                    ? "Yes"
                    : "No",

            insta360_equipment_terms:
                selectedService === "insta360"
                    ? (
                        equipmentCheckbox && equipmentCheckbox.checked
                            ? "Yes"
                            : "No"
                    )
                    : "Not applicable"
        };
    }

    /* ======================================================
       SUBMIT BOOKING TO FORMSPREE
       ====================================================== */

    async function sendBooking(payload) {
        const response = await fetch(
            BOOKING_CONFIG.endpoint,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },

                body: JSON.stringify(payload)
            }
        );

        let result = {};

        try {
            result = await response.json();
        } catch (error) {
            // Some responses may not contain JSON.
        }

        if (!response.ok) {
            let errorMessage =
                "Your booking could not be submitted. Please try again.";

            if (
                Array.isArray(result.errors) &&
                result.errors.length > 0
            ) {
                const messages = result.errors
                    .map(function (item) {
                        return item.message || "";
                    })
                    .filter(Boolean);

                if (messages.length > 0) {
                    errorMessage = messages.join(" ");
                }
            }

            throw new Error(errorMessage);
        }

        return result;
    }

    /* ======================================================
       FORM SUBMISSION
       ====================================================== */

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        if (isSubmitting) {
            return;
        }

        clearStatus();
        updateMinimumDate();

        if (!validateBooking()) {
            return;
        }

        const payload = buildBookingPayload();

        setSubmitting(true);

        showStatus(
            "Please wait while we submit your booking request...",
            "info"
        );

        try {
            await sendBooking(payload);

            // Reset the form after Formspree accepts the request.
            form.reset();

            // Clear selected services.
            serviceInputs.forEach(function (radio) {
                radio.checked = false;
            });

            updateServiceSelection();

            // Show one clear success message.
            showStatus(
                "Booking Request Submitted Successfully! " +
                "Thank you, " +
                payload.agent_name +
                ". Your booking request has been received " +
                "by our booking system. " +
                "The Jawitz Centurion Marketing Department " +
                "will review your request and confirm availability. " +
                "Please note that your booking is not yet confirmed.",
                "success"
            );

            if (statusMessage) {
                statusMessage.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            }

        } catch (error) {
            console.error(
                "Jawitz booking submission failed:",
                error
            );

            showStatus(
                "We could not submit your booking request. " +
                (error.message || "Please try again.") +
                " If the problem continues, please contact " +
                "marketing@jawitzcenturion.co.za.",
                "error"
            );

        } finally {
            setSubmitting(false);
        }
    });

});