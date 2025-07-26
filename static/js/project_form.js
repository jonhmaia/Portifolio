document.addEventListener('DOMContentLoaded', function() {
    // Character counters
    function setupCounter(inputId, counterId, maxLength) {
        const input = document.getElementById(inputId);
        const counter = document.getElementById(counterId);
        
        if (!input || !counter) return;

        function updateCounter() {
            const length = input.value.length;
            counter.textContent = `${length}/${maxLength}`;
            counter.classList.remove('warning', 'danger');
            if (length > maxLength) {
                counter.classList.add('danger');
            } else if (length > maxLength * 0.9) {
                counter.classList.add('warning');
            }
        }
        
        input.addEventListener('input', updateCounter);
        updateCounter(); // Initial call
    }

    if(document.getElementById('id_titulo')){
        setupCounter('id_titulo', 'titulo-counter', 100);
        setupCounter('id_subtitulo', 'subtitulo-counter', 150);
        setupCounter('id_descricao_curta', 'descricao-curta-counter', 300);
        setupCounter('id_descricao_completa', 'descricao-completa-counter', 2000);
    }


    // Tech selection
    const techItems = document.querySelectorAll('.tech-item');
    if (techItems.length > 0) {
        techItems.forEach(item => {
            const checkbox = item.querySelector('.tech-checkbox');
            if(checkbox) {
                item.addEventListener('click', function(e) {
                    // Prevent clicks on the label from firing twice
                    if (e.target.tagName !== 'INPUT') {
                        checkbox.checked = !checkbox.checked;
                    }
                    this.classList.toggle('selected', checkbox.checked);
                });
            }
        });
    }

    // Image preview
    const imageInput = document.getElementById('id_imagem_principal');
    const previewContainer = document.getElementById('image-preview-container');
    
    if (imageInput && previewContainer) {
        const removeImageBtn = document.createElement('button');
        removeImageBtn.type = 'button';
        removeImageBtn.className = 'btn-close remove-image-btn';
        removeImageBtn.setAttribute('aria-label', 'Remove image');

        function showImagePreview(file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewContainer.innerHTML = ''; // Clear previous preview
                const img = document.createElement('img');
                img.src = e.target.result;
                img.className = 'image-preview';
                previewContainer.appendChild(img);
                previewContainer.appendChild(removeImageBtn);
                removeImageBtn.style.display = 'block';
            }
            reader.readAsDataURL(file);
        }

        if (imageInput.files && imageInput.files[0]) {
            showImagePreview(imageInput.files[0]);
        }

        imageInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                showImagePreview(this.files[0]);
            }
        });

        previewContainer.addEventListener('click', function(e) {
            if(e.target.classList.contains('remove-image-btn')) {
                 imageInput.value = ''; // Clear the file input
                previewContainer.innerHTML = ''; // Remove the preview
            }
        });
    }

    // Preview Modal
    const previewModalEl = document.getElementById('previewModal');
    if (previewModalEl) {
        const previewButton = document.getElementById('preview-button');
        
        if(previewButton) {
            const previewModal = new bootstrap.Modal(previewModalEl);
            previewButton.addEventListener('click', function() {
                console.log('Botão de pré-visualização clicado!');
                document.getElementById('preview-titulo').textContent = document.getElementById('id_titulo').value;
                document.getElementById('preview-subtitulo').textContent = document.getElementById('id_subtitulo').value;
                document.getElementById('preview-descricao-curta').textContent = document.getElementById('id_descricao_curta').value;
                document.getElementById('preview-descricao-completa').textContent = document.getElementById('id_descricao_completa').value;
                
                const statusEl = document.getElementById('id_status');
                const statusBadge = document.getElementById('preview-status');
                if (statusEl && statusBadge) {
                    statusBadge.textContent = statusEl.options[statusEl.selectedIndex].text;
                    statusBadge.className = 'status-badge status-' + statusEl.value;
                }

                const techNames = [];
                document.querySelectorAll('.tech-item input[type="checkbox"]:checked').forEach(checkbox => {
                    const label = checkbox.closest('.tech-item').querySelector('label');
                    if (label) {
                        techNames.push(label.textContent.trim());
                    }
                });
                const techPreview = document.getElementById('preview-tecnologias');
                if(techPreview) techPreview.textContent = techNames.join(', ');

                const startDate = document.getElementById('preview-data-inicio');
                if(startDate) startDate.textContent = document.getElementById('id_data_inicio').value || 'Não definida';
                const endDate = document.getElementById('preview-data-conclusao');
                if(endDate) endDate.textContent = document.getElementById('id_data_conclusao').value || 'Não definida';
                
                const repoLink = document.getElementById('preview-link-repositorio');
                const repoUrl = document.getElementById('id_link_repositorio').value;
                if(repoLink) {
                    repoLink.href = repoUrl;
                    repoLink.style.display = repoUrl ? 'inline-block' : 'none';
                }

                const deployLink = document.getElementById('preview-link-deploy');
                const deployUrl = document.getElementById('id_link_deploy').value;
                if(deployLink){
                    deployLink.href = deployUrl;
                    deployLink.style.display = deployUrl ? 'inline-block' : 'none';
                }

                const previewImage = document.getElementById('preview-imagem');
                const imagePreviewInForm = previewContainer ? previewContainer.querySelector('.image-preview') : null;
                const defaultImageUrl = window.defaultImageUrl || '';

                if (previewImage) {
                    const placeholder = document.getElementById('preview-image-placeholder');

                    if (imagePreviewInForm && imagePreviewInForm.src) {
                        previewImage.src = imagePreviewInForm.src;
                        previewImage.style.display = 'block';
                        if (placeholder) placeholder.style.display = 'none';
                    } else {
                        previewImage.style.display = 'none';
                        if (placeholder) placeholder.style.display = 'block';
                    }
                }
                previewModal.show();
            });
        }
    }
});