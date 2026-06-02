(function () {
    var modal = document.querySelector("[data-diagram-modal]");
    if (!modal) {
        return;
    }

    var triggers = Array.prototype.slice.call(document.querySelectorAll("[data-diagram-trigger]"));
    if (!triggers.length) {
        return;
    }

    var modalImage = modal.querySelector("[data-diagram-modal-image]");
    var modalCaption = modal.querySelector("[data-diagram-modal-caption]");
    var modalContext = modal.querySelector("[data-diagram-modal-context]");
    var closeButton = modal.querySelector("[data-diagram-close-button]");
    var previousButton = modal.querySelector("[data-diagram-prev]");
    var nextButton = modal.querySelector("[data-diagram-next]");
    var lastTrigger = null;
    var currentIndex = -1;

    function renderTrigger(trigger) {
        currentIndex = triggers.indexOf(trigger);
        lastTrigger = trigger;
        modalImage.src = trigger.getAttribute("data-full-image") || "";
        modalImage.alt = trigger.getAttribute("data-alt") || "";
        modalCaption.textContent = trigger.getAttribute("data-alt") || "";

        var contextUrl = trigger.getAttribute("data-context-url");
        var contextLabel = trigger.getAttribute("data-context-label") || "See it in context";

        if (contextUrl) {
            modalContext.hidden = false;
            modalContext.href = contextUrl;
            modalContext.textContent = contextLabel;
        } else {
            modalContext.hidden = true;
        }
    }

    function openModal(trigger) {
        renderTrigger(trigger);

        modal.hidden = false;
        document.body.classList.add("diagram-modal-open");
        closeButton.focus();
    }

    function stepModal(delta) {
        if (modal.hidden || currentIndex === -1) {
            return;
        }

        var nextIndex = (currentIndex + delta + triggers.length) % triggers.length;
        renderTrigger(triggers[nextIndex]);
    }

    function closeModal() {
        if (modal.hidden) {
            return;
        }

        modal.hidden = true;
        document.body.classList.remove("diagram-modal-open");
        modalImage.src = "";
        modalImage.alt = "";
        modalCaption.textContent = "";
        modalContext.removeAttribute("href");
        currentIndex = -1;

        if (lastTrigger) {
            lastTrigger.focus();
        }
    }

    triggers.forEach(function (trigger) {
        trigger.addEventListener("click", function () {
            openModal(trigger);
        });
    });

    modal.querySelectorAll("[data-diagram-close], [data-diagram-close-button]").forEach(function (node) {
        node.addEventListener("click", closeModal);
    });

    if (previousButton) {
        previousButton.addEventListener("click", function () {
            stepModal(-1);
        });
    }

    if (nextButton) {
        nextButton.addEventListener("click", function () {
            stepModal(1);
        });
    }

    document.addEventListener("keydown", function (event) {
        if (modal.hidden) {
            return;
        }

        if (event.key === "Escape") {
            closeModal();
            return;
        }

        if (event.key === "ArrowLeft") {
            event.preventDefault();
            stepModal(-1);
            return;
        }

        if (event.key === "ArrowRight") {
            event.preventDefault();
            stepModal(1);
        }
    });
})();
