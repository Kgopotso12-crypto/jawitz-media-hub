
"use strict";

/* ==========================================================
   JAWITZ MEDIA HUB
   MAIN WEBSITE JAVASCRIPT

   Jawitz Properties Centurion

   File: js/main.js

   FEATURES:
   1. Mobile navigation
   2. Responsive navigation handling
   3. Tips & Resources search
   4. Resource category filters
   5. Expandable resource tips
   6. Contact form handling
   ========================================================== */

document.addEventListener("DOMContentLoaded", function () {

    /* ======================================================
       1. MOBILE NAVIGATION
       ====================================================== */

    const menuToggle = document.querySelector(
        ".menu-toggle"
    );

    const navigation =
        document.getElementById("mobile-navigation") ||
        document.getElementById("site-navigation");

    const mobileBreakpoint = window.matchMedia(
        "(max-width: 767px)"
    );

    function isMobileView() {
        return mobileBreakpoint.matches;
    }

    function closeMenu() {

        if (!menuToggle || !navigation) {
            return;
        }

        menuToggle.setAttribute(
            "aria-expanded",
            "false"
        );

        menuToggle.setAttribute(
            "aria-label",
            "Open navigation menu"
        );

        navigation.classList.remove("is-open");

        /*
         * Only hide the navigation on mobile
         * when it is closed.
         *
         * Homepage desktop navigation should
         * remain visible on larger screens.
         */

        if (navigation.id === "site-navigation") {

            navigation.hidden = isMobileView();

        } else {

            navigation.hidden = true;
        }
    }

    function openMenu() {

        if (!menuToggle || !navigation) {
            return;
        }

        menuToggle.setAttribute(
            "aria-expanded",
            "true"
        );

        menuToggle.setAttribute(
            "aria-label",
            "Close navigation menu"
        );

        navigation.hidden = false;

        navigation.classList.add("is-open");
    }

    function updateNavigationForScreenSize() {

        if (!menuToggle || !navigation) {
            return;
        }

        const isOpen =
            menuToggle.getAttribute(
                "aria-expanded"
            ) === "true";

        if (isMobileView()) {

            navigation.hidden = !isOpen;

        } else {

            /*
             * The homepage uses the shared
             * site-navigation element.
             *
             * On desktop it should remain
             * available to the CSS layout.
             */

            if (navigation.id === "site-navigation") {

                navigation.hidden = false;

            } else {

                /*
                 * Other pages use a separate
                 * mobile-navigation element.
                 *
                 * Desktop navigation is
                 * provided by .desktop-nav.
                 */

                navigation.hidden = true;
            }

            navigation.classList.remove("is-open");

            menuToggle.setAttribute(
                "aria-expanded",
                "false"
            );

            menuToggle.setAttribute(
                "aria-label",
                "Open navigation menu"
            );
        }
    }

    if (menuToggle && navigation) {

        updateNavigationForScreenSize();

        /* OPEN / CLOSE MENU */

        menuToggle.addEventListener(
            "click",
            function () {

                const isExpanded =
                    menuToggle.getAttribute(
                        "aria-expanded"
                    ) === "true";

                if (isExpanded) {

                    closeMenu();

                } else {

                    openMenu();
                }
            }
        );

        /* CLOSE MENU WHEN LINK IS CLICKED */

        navigation.querySelectorAll("a").forEach(
            function (link) {

                link.addEventListener(
                    "click",
                    function () {

                        if (
                            menuToggle.getAttribute(
                                "aria-expanded"
                            ) === "true"
                        ) {

                            closeMenu();
                        }
                    }
                );
            }
        );

        /* CLOSE MENU WITH ESCAPE KEY */

        document.addEventListener(
            "keydown",
            function (event) {

                if (event.key === "Escape") {

                    closeMenu();

                    if (isMobileView()) {
                        menuToggle.focus();
                    }
                }
            }
        );

        /* CLOSE MENU WHEN CLICKING OUTSIDE */

        document.addEventListener(
            "click",
            function (event) {

                const isOpen =
                    menuToggle.getAttribute(
                        "aria-expanded"
                    ) === "true";

                if (!isOpen) {
                    return;
                }

                if (
                    !navigation.contains(event.target) &&
                    !menuToggle.contains(event.target)
                ) {

                    closeMenu();
                }
            }
        );

        /* UPDATE MENU WHEN SCREEN SIZE CHANGES */

        if (typeof mobileBreakpoint.addEventListener === "function") {

            mobileBreakpoint.addEventListener(
                "change",
                updateNavigationForScreenSize
            );

        } else if (
            typeof mobileBreakpoint.addListener === "function"
        ) {

            mobileBreakpoint.addListener(
                updateNavigationForScreenSize
            );
        }
    }

    /* ======================================================
       2. TIPS & RESOURCES SEARCH
       ====================================================== */

    const searchInput = document.getElementById(
        "resource-search-input"
    );

    const filterButtons = Array.from(
        document.querySelectorAll(".filter-button")
    );

    const resourceCards = Array.from(
        document.querySelectorAll(".resource-card")
    );

    const emptyMessage = document.getElementById(
        "resource-empty-message"
    );

    let activeFilter = "all";

    function normaliseText(text) {

        return String(text || "")
            .toLowerCase()
            .replace(/\s+/g, " ")
            .trim();
    }

    function filterResources() {

        if (!resourceCards.length) {
            return;
        }

        const searchQuery = normaliseText(
            searchInput ? searchInput.value : ""
        );

        let visibleCount = 0;

        resourceCards.forEach(function (card) {

            const category = card.dataset.category || "";

            const categoryMatches =
                activeFilter === "all" ||
                category === activeFilter;

            const cardText = normaliseText(
                card.textContent
            );

            const searchMatches =
                !searchQuery ||
                cardText.includes(searchQuery);

            const shouldShow =
                categoryMatches && searchMatches;

            card.hidden = !shouldShow;

            if (shouldShow) {
                visibleCount++;
            }
        });

        if (emptyMessage) {

            emptyMessage.hidden = visibleCount !== 0;
        }
    }

    /* SEARCH INPUT */

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            filterResources
        );
    }

    /* RESOURCE CATEGORY FILTERS */

    filterButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                activeFilter =
                    button.dataset.filter || "all";

                filterButtons.forEach(
                    function (filterButton) {

                        const isActive =
                            filterButton === button;

                        filterButton.classList.toggle(
                            "active",
                            isActive
                        );

                        filterButton.setAttribute(
                            "aria-pressed",
                            String(isActive)
                        );
                    }
                );

                filterResources();
            }
        );
    });

    /* ======================================================
       3. EXPAND RESOURCE TIPS
       ====================================================== */

    const expandButtons = document.querySelectorAll(
        ".resource-expand"
    );

    expandButtons.forEach(function (button) {

        const detailsId = button.getAttribute(
            "aria-controls"
        );

        if (!detailsId) {
            return;
        }

        const details = document.getElementById(
            detailsId
        );

        if (!details) {
            return;
        }

        button.addEventListener(
            "click",
            function () {

                const isExpanded =
                    button.getAttribute(
                        "aria-expanded"
                    ) === "true";

                const shouldExpand = !isExpanded;

                details.hidden = !shouldExpand;

                button.setAttribute(
                    "aria-expanded",
                    String(shouldExpand)
                );

                button.innerHTML = shouldExpand
                    ? 'SHOW LESS <span aria-hidden="true">&uarr;</span>'
                    : 'VIEW ALL TIPS <span aria-hidden="true">&rarr;</span>';
            }
        );
    });

    /* ======================================================
       4. CONTACT FORM
       ====================================================== */

    const contactForm = document.getElementById(
        "contact-form"
    );

    if (contactForm) {

        contactForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                /*
                 * The Contact Form is separate
                 * from the Booking Form.
                 *
                 * Booking requests are handled
                 * by js/bookings.js and Formspree.
                 *
                 * Contact submissions require
                 * their own configured endpoint
                 * before they can be sent online.
                 */

                const status = document.getElementById(
                    "contact-form-status"
                );

                if (status) {

                    status.textContent =
                        "Online contact submissions are not active yet. " +
                        "Please email marketing@jawitzcenturion.co.za " +
                        "or call 066 153 1800.";

                    status.setAttribute(
                        "role",
                        "status"
                    );
                }
            }
        );
    }

    /* ======================================================
       5. INITIALISE WEBSITE
       ====================================================== */

    filterResources();

});
