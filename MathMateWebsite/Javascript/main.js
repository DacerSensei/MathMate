async function RenderLoading(callback) {
    const response = await fetch('../Library/loading.html');
    const loadingHTML = await response.text();
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = loadingHTML;
    const body = document.body;
    body.prepend(...tempContainer.childNodes);
}

RenderLoading();