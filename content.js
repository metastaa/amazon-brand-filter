(function() {
    'use strict';

    // BLOKLANACAK_MARKALAR'ı storage'dan yükle
    let BLOKLANACAK_MARKALAR = [];
    browser.storage.local.get('blockedBrands').then(data => {
        BLOKLANACAK_MARKALAR = data.blockedBrands || ['zxc4w'];
        if (!data.blockedBrands) {
            browser.storage.local.set({ blockedBrands: BLOKLANACAK_MARKALAR });
        }
        init(); // Başlatma fonksiyonunu burada çağırıyoruz
    });

    const createUI = () => {
        // Buton Konteynırı
        const btnContainer = document.createElement('div');
        btnContainer.id = "amazonBlockerButtons";
        btnContainer.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 30px;
            z-index: 2147483647;
            display: flex;
            gap: 12px;
        `;

        // BLOCK Butonu
        const blockBtn = document.createElement('button');
        blockBtn.id = "amazonBlockerBlockBtn";
        blockBtn.textContent = "BLOCK";
        blockBtn.style.cssText = `
            padding: 12px 24px;
            background: #e74c3c;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: bold;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.25);
            transition: transform 0.1s;
        `;

        // AYARLAR Butonu
        const settingsBtn = document.createElement('button');
        settingsBtn.id = "amazonBlockerSettingsBtn";
        settingsBtn.textContent = "⚙️";
        settingsBtn.style.cssText = `
            padding: 12px 24px;
            background: #e74c3c;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 18px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.25);
            transition: transform 0.1s;
        `;

        // Modal CSS
        const modalStyle = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 0 30px rgba(0,0,0,0.3);
            z-index: 2147483646;
            width: 320px;
            max-height: 90vh;
            overflow-y: auto;
        `;

        // Block Modal
        const blockModal = document.createElement('div');
        blockModal.id = "amazonBlockerBlockModal";
        blockModal.style.cssText = modalStyle + 'display: none;';
        blockModal.innerHTML = `
            <div style="position: relative;">
                <span class="amazonBlockerCloseBtn" style="
                    position: absolute;
                    top: 5px;
                    right: 10px;
                    cursor: pointer;
                    font-size: 24px;
                    color: #666;
                ">×</span>
                <h3 style="margin:0 0 15px 0; font-size:20px;">🔒 Block Keyword</h3>
                <input type="text" id="amazonBlockerInput"
                       placeholder="Enter brand/keyword"
                       style="width:100%; padding:10px; margin-bottom:15px; border:1px solid #ddd; border-radius:4px;">
                <button id="amazonBlockerAddBtn"
                        style="width:100%; padding:12px; background:#2ecc71; color:white; border:none; border-radius:4px; cursor:pointer;">
                    Add Filter
                </button>
                <div id="amazonBlockerError" style="color:#e74c3c; margin-top:10px; font-size:13px;"></div>
            </div>
        `;

        // Settings Modal
        const settingsModal = document.createElement('div');
        settingsModal.id = "amazonBlockerSettingsModal";
        settingsModal.style.cssText = modalStyle + 'display: none;';
        settingsModal.innerHTML = `
            <div style="position: relative;">
                <span class="amazonBlockerCloseBtn" style="
                    position: absolute;
                    top: 5px;
                    right: 10px;
                    cursor: pointer;
                    font-size: 24px;
                    color: #666;
                ">×</span>
                <h3 style="margin:0 0 15px 0; font-size:20px;">⚙️ Filter Settings</h3>
                <button id="amazonBlockerResetBtn"
                        style="width:100%; padding:12px; background:#e74c3c; color:white; border:none; border-radius:4px; cursor:pointer; margin-bottom:20px;">
                    Reset All Filters
                </button>
                <div style="font-weight:500; margin-bottom:10px;">Active Filters (Click to remove):</div>
                <div id="amazonBlockerKeywordList"></div>
            </div>
        `;

        // DOM'a ekle
        btnContainer.append(blockBtn, settingsBtn);
        document.body.append(btnContainer, blockModal, settingsModal);
    };

    const initEvents = () => {
        // Kapatma Butonları
        const closeButtons = document.querySelectorAll('.amazonBlockerCloseBtn');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                btn.closest('div[id$="Modal"]').style.display = 'none';
            });
        });

        // Block Modal Aç/Kapa
        document.getElementById('amazonBlockerBlockBtn').addEventListener('click', () => {
            document.getElementById('amazonBlockerBlockModal').style.display = 'block';
        });

        // Settings Modal Aç/Kapa
        document.getElementById('amazonBlockerSettingsBtn').addEventListener('click', () => {
            const keywordList = document.getElementById('amazonBlockerKeywordList');
            keywordList.innerHTML = BLOKLANACAK_MARKALAR.map(keyword => `
                <div style="padding:8px 12px; margin:5px 0; background:#f8f8f8; border-radius:4px; cursor:pointer; display:flex; justify-content:space-between; align-items:center;">
                    <span>${keyword}</span>
                    <span style="color:#e74c3c; font-weight:bold;">×</span>
                </div>
            `).join('');

            // Kaldırma Fonksiyonu
            keywordList.querySelectorAll('div').forEach((item, index) => {
                item.addEventListener('click', () => {
                    BLOKLANACAK_MARKALAR.splice(index, 1);
                    browser.storage.local.set({ blockedBrands: BLOKLANACAK_MARKALAR });
                    hideBrands();
                    document.getElementById('amazonBlockerSettingsModal').style.display = 'none';
                });
            });

            document.getElementById('amazonBlockerSettingsModal').style.display = 'block';
        });

        // Reset Butonu
        document.getElementById('amazonBlockerResetBtn').addEventListener('click', () => {
            BLOKLANACAK_MARKALAR = [];
            browser.storage.local.set({ blockedBrands: BLOKLANACAK_MARKALAR });
            hideBrands();
            document.getElementById('amazonBlockerSettingsModal').style.display = 'none';
        });

        // Keyword Ekleme
        document.getElementById('amazonBlockerAddBtn').addEventListener('click', () => {
            const input = document.getElementById('amazonBlockerInput');
            const errorDiv = document.getElementById('amazonBlockerError');

            if (input.value.trim()) {
                BLOKLANACAK_MARKALAR.push(input.value.trim());
                browser.storage.local.set({ blockedBrands: BLOKLANACAK_MARKALAR });
                input.value = '';
                errorDiv.textContent = '';
                document.getElementById('amazonBlockerBlockModal').style.display = 'none';
                hideBrands();
            } else {
                errorDiv.textContent = 'Please enter a valid keyword!';
            }
        });
    };

    const hideBrands = () => {
        const searchResults = document.querySelectorAll('div.s-result-item, div[data-asin]');
        searchResults.forEach(item => {
            const itemText = item.textContent.toUpperCase();
            const shouldHide = BLOKLANACAK_MARKALAR.some(keyword =>
                itemText.includes(keyword.toUpperCase())
            );
            item.style.display = shouldHide ? 'none' : '';
        });
    };

    const init = () => {
        createUI();
        initEvents();
        hideBrands();
        new MutationObserver(hideBrands).observe(document.body, {
            childList: true,
            subtree: true
        });
    };

    // init() fonksiyonu storage verisi alındıktan sonra çağrılır
})();