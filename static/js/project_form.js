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

    // Gallery Management
    const addGalleryBtn = document.getElementById('add-gallery-image');
    const galleryContainer = document.getElementById('gallery-images-container');
    const galleryTemplate = document.querySelector('.gallery-item-template');
    
    function setupGalleryItem(item) {
        const fileInput = item.querySelector('.gallery-file-input');
        const uploadLabel = item.querySelector('.gallery-upload-label');
        const preview = item.querySelector('.gallery-preview');
        const removeBtn = item.querySelector('.remove-gallery-item');
        const uploadArea = item.querySelector('.gallery-upload-area');
        
        // File input change handler
        if (fileInput) {
            fileInput.addEventListener('change', function() {
                if (this.files && this.files[0]) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        if (preview) {
                            preview.src = e.target.result;
                            preview.classList.remove('d-none');
                        }
                        if (uploadLabel) {
                            uploadLabel.style.display = 'none';
                        }
                    };
                    reader.readAsDataURL(this.files[0]);
                }
            });
            
            // Upload area click handler
            if (uploadArea) {
                uploadArea.addEventListener('click', function() {
                    fileInput.click();
                });
            }
        }
        
        // Remove button handler
        if (removeBtn) {
            removeBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                if (confirm('Tem certeza que deseja remover esta imagem?')) {
                    removeGalleryItem(this);
                }
            });
        }
    }
    
    if (addGalleryBtn && galleryContainer && galleryTemplate) {
        let galleryItemCount = galleryContainer.children.length;
        
        // Add new gallery item
        addGalleryBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            const newItem = galleryTemplate.cloneNode(true);
            newItem.classList.remove('gallery-item-template', 'd-none');
            
            // Os nomes dos campos já estão corretos como arrays
            // gallery_images[], gallery_description[], gallery_order[]
            
            galleryContainer.appendChild(newItem);
            galleryItemCount++;
            
            setupGalleryItem(newItem);
        });
        
        // Setup existing gallery items
        document.querySelectorAll('.gallery-item:not(.gallery-item-template)').forEach(item => {
            setupGalleryItem(item);
        });
    }
    
    // Função global para remover item da galeria
    window.removeGalleryItem = function(button, imageId = null) {
        const galleryItem = button.closest('.gallery-item');
        
        if (imageId || galleryItem.dataset.imageId) {
            // Marcar imagem existente para remoção
            const hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.name = 'removed_images';
            hiddenInput.value = imageId || galleryItem.dataset.imageId;
            document.querySelector('form').appendChild(hiddenInput);
        }
        
        galleryItem.remove();
    };

    // Função para marcar imagem para exclusão
    window.markImageForDeletion = function(button) {
        const galleryItem = button.closest('.gallery-item');
        const imageId = galleryItem.dataset.imageId;
        const deletionOverlay = galleryItem.querySelector('.deletion-overlay');
        const imagesToDeleteInput = document.getElementById('images_to_delete');
        
        if (imageId && deletionOverlay && imagesToDeleteInput) {
            // Adicionar ID à lista de imagens para exclusão
            let imagesToDelete = imagesToDeleteInput.value ? imagesToDeleteInput.value.split(',') : [];
            if (!imagesToDelete.includes(imageId)) {
                imagesToDelete.push(imageId);
                imagesToDeleteInput.value = imagesToDelete.join(',');
            }
            
            // Mostrar overlay de exclusão
            deletionOverlay.style.display = 'flex';
            galleryItem.classList.add('marked-for-deletion');
        }
    };

    // Função para desfazer marcação de exclusão
    window.undoImageDeletion = function(button) {
        const galleryItem = button.closest('.gallery-item');
        const imageId = galleryItem.dataset.imageId;
        const deletionOverlay = galleryItem.querySelector('.deletion-overlay');
        const imagesToDeleteInput = document.getElementById('images_to_delete');
        
        if (imageId && deletionOverlay && imagesToDeleteInput) {
            // Remover ID da lista de imagens para exclusão
            let imagesToDelete = imagesToDeleteInput.value ? imagesToDeleteInput.value.split(',') : [];
            imagesToDelete = imagesToDelete.filter(id => id !== imageId);
            imagesToDeleteInput.value = imagesToDelete.join(',');
            
            // Esconder overlay de exclusão
            deletionOverlay.style.display = 'none';
            galleryItem.classList.remove('marked-for-deletion');
        }
    };

    // Setup dos botões de exclusão para imagens existentes
    document.querySelectorAll('.remove-gallery-btn').forEach(button => {
        const galleryItem = button.closest('.gallery-item');
        if (galleryItem && galleryItem.dataset.imageId) {
            // Para imagens existentes, usar marcação para exclusão
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                markImageForDeletion(this);
            });
        }
    });

    // Setup dos botões de desfazer exclusão
    document.querySelectorAll('.undo-deletion-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            undoImageDeletion(this);
        });
    });
});