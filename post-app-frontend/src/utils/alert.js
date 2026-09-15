export function showSuccess(message) {

    showAlert(message, 'success');

}

export function showError(message) {

    showAlert(message, 'danger');

}

function showAlert(message, type) {

    const alertContainer =
        document.getElementById('alert-container');

    alertContainer.innerHTML = `
        <div
            class="alert alert-${type} alert-dismissible fade show"
            role="alert"
        >
            ${escapeHtml(message)}

            <button
                type="button"
                class="btn-close"
                aria-label="Close"
            ></button>
        </div>
    `;

    const alertElement =
        alertContainer.querySelector('.alert');

    const closeButton =
        alertElement.querySelector('.btn-close');

    // Allow user to close manually
    closeButton.addEventListener('click', () => {

        alertElement.remove();

    });

    // Automatically remove after 3 seconds
    setTimeout(() => {

        if (alertElement) {
            alertElement.remove();
        }

    }, 3000);

}

function escapeHtml(value) {

    const div = document.createElement('div');

    div.textContent = value;

    return div.innerHTML;
}