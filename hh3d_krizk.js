    // ==UserScript==
    // @name          HH3D Auto - Edited by Krizk
    // @namespace     hh3d-tool-krizk
    // @version       5.9.2
    // @description   Auto  HH3D
    // @author        Cre: [Unknown] - Edited by Krizk
    // @include       *://hoathinh3d.co*/*
    // @exclude       *://hoathinh3d.co/khoang-mach*
    // @require       https://cdn.jsdelivr.net/npm/sweetalert2@11.26.12/dist/sweetalert2.all.min.js
    // @run-at        document-start
    // @grant         unsafeWindow
    // @connect       raw.githubusercontent.com

    // ==/UserScript==
    (async function() {
        'use strict';

        console.log('%c[HH3D Script] Tải thành công. Đang khởi tạo UI tùy chỉnh.',
        'background: #222; color: #bada55; padding: 2px 5px; border-radius: 3px;');

        // ===============================================
        // HÀM TIỆN ÍCH CHUNG
        // ===============================================
        const weburl = window.location.origin.replace(/\/+$/, '') + '/';
        const baseUrl = "https://raw.githubusercontent.com";
        const repoPath = "/shinylee1205/Anonymous";
        const branch = "/refs/heads/main";
        //const WebUrlfileName = "/WebURL.json";
        //const Weblink = baseUrl + repoPath + branch + WebUrlfileName;
        // const Webresponse = await fetch(Weblink);
        // const weburl = (await Webresponse.text()).trim();

        // lấy chuỗi và bỏ khoảng trắng thừa

        const ajaxUrl = weburl + 'wp-content/themes/halimmovies-child/hh3d-ajax.php';
        let questionDataCache = null;
        let isCssInjected = false;
        let userBetCount = 0;
        let userBetStones = [];

        //   act: {
            //   tltmOpen: '1354a8a1',
            //   tltmTimer: '2a2e1a5a',
            //   plOpen: '9e73a16b',
            //   plTimer: '5bb9c745',
            //   plClaim: 'a278453e',
            //   kmList: '64eaa497',
            //   kmEnter: '5d6cbc77',
            //   kmUsers: '0763c2d5',
            //   kmClaim: '7a445af6',
            //   kmBuy: '241d4835',
            //   kmReward: '787974c8',
            //   kmCheck: '7e4560ce',
            //   kmNotif: '165d5ce3',
            //   kmOwner: 'fafb8844',
            //   kmAttack: '660d10f0',
            //   kmLeave: '54608a24',
            //   kmRefresh: '7ea284d4',
            //   bossCheckElem: '72ced4dc',
            //   bossTimer: '75b04751',
            //   bossHistory: 'e1594bb2',
            //   bossBoard: 'aa509745',
            //   bossAttack: '6af45008',
            //   bossGet: '2ad28e41',
            //   bossBalance: '13ecac72',
            //   bossBuy: '9cfa093a',
            //   bossInventory: 'ce5635a7',
            //   bossOpenChest: '61ffdf1a',
            //   bossActivate: '1c31f726',
            //   dtExchange: 'a06553ee',
            //   dtLoad: 'e3e86547',
            //   dtBet: '9edf2e7e',
            //   dtClaim: '5e269d3c',
            //   dtNewbie: 'b8427634',
            //   vdLoad: 'a265eca2',
            //   vdSave: 'ba4ef77c',
            //   lotterySpin: '815b016f',
            //   lotteryHistory: '7b227116'
            // }
        let hData = null; // Biến toàn cục lưu trữ hh3dData đã được parse và decode       
        /**
         * Parse và decode hh3dData từ HTML
         * @param {string} html - HTML chứa hh3dData mặc định
         * @param {string} k - Key để decode (optional, lấy từ HTML nếu không truyền)
         * @param {string} d - Encrypted data (optional, lấy từ HTML nếu không truyền)
         * @returns {object} hh3dData hoàn chỉnh với thuộc tính act đã được decode
         */
        function parseHh3dData(html, k = null, d = null) {
          try {
            let hh3dData = {};
            
            // ⭐ BƯỚC 1: Lấy hh3dData mặc định từ HTML
            const hh3dMatch = html.match(/var\s+hh3dData\s*=\s*({[^}]+})/);
            if (hh3dMatch) {
              try {
                hh3dData = JSON.parse(hh3dMatch[1]);
                //console.log('✅ Đã parse hh3dData mặc định:', Object.keys(hh3dData));
              } catch (e) {
                console.log('⚠️ Không thể parse hh3dData từ HTML:', e.message);
              }
            } else {
              console.log('⚠️ Không tìm thấy hh3dData trong HTML');
            }
            
            // ⭐ BƯỚC 2: Lấy k và d từ HTML nếu không được truyền vào
            if (!k || !d) {
              // Tìm script chứa k và d
              // Pattern: var k="...",d="...";
              const scriptMatch = html.match(/var\s+k\s*=\s*"([^"]+)"\s*,\s*d\s*=\s*"([^"]+)"/);
              if (scriptMatch) {
                k = k || scriptMatch[1];
                d = d || scriptMatch[2];
                // console.log('✅ Đã lấy k và d từ HTML');
              } else {
                // console.log('⚠️ Không tìm thấy k và d trong HTML');
                return hh3dData; // Trả về hh3dData mặc định
              }
            }
            
            // ⭐ BƯỚC 3: Decode encrypted data
            if (k && d) {
              try {
                // Base64 decode (normalize URL-safe base64 → standard base64, then add padding)
                const b64 = d.replace(/\\/g, '').replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '');
                const b64Padded = b64.padEnd(b64.length + (4 - b64.length % 4) % 4, '=');
                // Debug: log invalid chars
                const invalidChars = b64Padded.replace(/[A-Za-z0-9+/=]/g, '');
                // if (invalidChars.length > 0) {
                //   console.log('⚠️ d có ký tự không hợp lệ (charCode):', [...invalidChars].map(c => c.charCodeAt(0)));
                // }
                // console.log('🔍 d (first 80):', d.substring(0, 80), '| len:', d.length);
                const decodedBytes = atob(b64Padded).split('').map(c => c.charCodeAt(0));
                
                // XOR với key
                let result = '';
                for (let i = 0; i < decodedBytes.length; i++) {
                  result += String.fromCharCode(
                    decodedBytes[i] ^ k.charCodeAt(i % k.length)
                  );
                }
                
                // Parse JSON
                const actData = JSON.parse(result);
                hh3dData.act = actData;
                
                // console.log('✅ Đã decode và gán hh3dData.act thành công');
              } catch (e) {
                console.log('❌ Lỗi khi decode data:', e.message);
              }
            }
            
            return hh3dData;
            
          } catch (error) {
            console.log('❌ Lỗi trong parseHh3dData:', error.message);
            return {};
          }
        }
        

        // Chỉ override khi đang ở trang Khoáng Mạch
    if (location.pathname.includes('khoang-mach') || location.href.includes('khoang-mach')) {
        const fastAttack = localStorage.getItem('khoangmach_fast_attack') === 'true';
        if (fastAttack) {
            const NEW_DELAY = 50;
            const originalSetInterval = window.setInterval;
            window.setInterval = function(callback, delay, ...args) {
                let actualDelay = delay;
                if (typeof callback === 'function' && callback.toString().includes('countdown--') &&
                        callback.toString().includes('clearInterval(countdownInterval)') &&
                        callback.toString().includes('executeAttack')){
                    actualDelay = NEW_DELAY
                    showNotification('Không được đánh đến khi hết thông báo này', 'error', 5500);
                }
            return originalSetInterval(callback, actualDelay, ...args);
            };
        }
    }
        // Cấu trúc menu
        // ⚠️ CHÚ Ý: Tất cả các task buttons đã được chuyển sang Quest List
        // Chỉ giữ lại Autorun controls trong menu này
        const LINK_GROUPS = []; // Autorun đã được chuyển lên xu-info

        function addStyle(css) {
            const style = document.createElement('style');
            style.type = 'text/css';
            style.appendChild(document.createTextNode(css));
            document.head.appendChild(style);
        }

     // ===== Khoáng Mạch-only UI addons =====
     addStyle(`
       .km-punch-btn{
         background:#e74c3c;color:#fff;border:none;
         width:28px;height:28px;border-radius:6px;
         cursor:pointer;display:inline-flex;align-items:center;justify-content:center;
         font-weight:700;
       }
       .km-punch-btn:hover{filter:brightness(1.05);}
     `);


   async function speak(textVN, textEN) {
        console.log("[TTS] Bắt đầu khởi tạo speak()");
        await new Promise(r => setTimeout(r, 300)); // đợi hệ thống load voice
        let voices = speechSynthesis.getVoices();
        if (!voices.length) {
        console.log("[TTS] Chưa có voice, chờ event voiceschanged...");
        await new Promise(res => {
            const onChange = () => {
            voices = speechSynthesis.getVoices();
            if (voices.length) {
                speechSynthesis.removeEventListener("voiceschanged", onChange);
                res();
            }
            };
            speechSynthesis.addEventListener("voiceschanged", onChange);
        });
        }

        voices = speechSynthesis.getVoices();
        console.log(`[TTS] Tổng số voice: ${voices.length}`);
        voices.forEach(v => console.log(`[VOICE] ${v.name} | ${v.lang}`));

        let voice = voices.find(v => /vi[-_]?VN/i.test(v.lang));
        let lang = "vi-VN";
        let text = textVN;

        if (!voice) {
        console.log("[TTS] Không có voice tiếng Việt, dùng tiếng Anh");
        voice = voices.find(v => /en[-_]?US/i.test(v.lang)) || voices[0];
        lang = "en-US";
        text = textEN;
        }

        if (!voice) return console.error("[TTS] ❌ Không tìm thấy voice khả dụng");

        const u = new SpeechSynthesisUtterance(text);
        u.voice = voice;
        u.lang = lang;
        u.rate = 0.8; // tốc độ nói
        u.onstart = () => console.log(`[TTS] ▶️ Bắt đầu đọc (${lang}): ${text}`);
        u.onend = () => console.log("[TTS] ✅ Hoàn tất đọc");
        u.onerror = e => console.error("[TTS] ❌ Lỗi:", e.error);

        speechSynthesis.cancel();
        speechSynthesis.speak(u);
    }

        /**
        * Lấy securityToken bằng cách fetch một URL (nếu có)
        * hoặc quét HTML của trang hiện tại (nếu không có URL).
        *
        * @param {string} [url] - (Tùy chọn) URL để fetch.
        * @returns {Promise<string|null>} - Một Promise sẽ resolve với token, hoặc null nếu thất bại.
        */

    async function getSecurityToken(url) {
        const logPrefix = "[SecurityTokenFetcher]";
        console.log(`${logPrefix} ▶️ Bắt đầu lấy security token từ ${url || 'trang hiện tại'}...`);
        let htmlContent = null;

        try {
            // 1. Lấy nội dung HTML (Fetch hoặc quét trang hiện tại)
            if (url) {
                const response = await fetch(url);
                if (!response.ok) return null;
                htmlContent = await response.text();
            } else {
                htmlContent = document.documentElement.outerHTML;
            }
            hData = parseHh3dData(htmlContent); // Cập nhật hh3dData từ html mới lấy được

            // 2. Quét Regex lấy Token mới
            const regex = /"securityToken"\s*:\s*"([^"]+)"/;
            const match = htmlContent.match(regex);

            if (match && match[1]) {
                const token = match[1];

                // 🔥 LOGIC MỚI: Kiểm tra xem URL yêu cầu có phải là trang hiện tại không
                // Nếu không truyền URL (!url) -> Mặc định là trang hiện tại
                // Nếu có URL -> Phải trùng khớp tuyệt đối với window.location.href
                const isCurrentPage = !url || (url === window.location.href);

                if (isCurrentPage) {
                    console.log(`${logPrefix} 🎯 URL trùng khớp trang hiện tại. Tiến hành cập nhật Global State...`);

                    // ============================================================
                    // 🔥 SỬA LỖI: CẬP NHẬT XUYÊN SANDBOX
                    // ============================================================

                    // Cách 1: Dùng unsafeWindow (Cách chuẩn của Tampermonkey)
                    if (typeof unsafeWindow !== 'undefined' && unsafeWindow.hh3dData) {
                        unsafeWindow.hh3dData.securityToken = token;
                        console.log(`${logPrefix} 🔓 Đã cập nhật hh3dData thông qua unsafeWindow.`);
                    }
                    // Cách 2: Fallback nếu không có unsafeWindow
                    else if (typeof window.hh3dData !== 'undefined') {
                        window.hh3dData.securityToken = token;
                        console.log(`${logPrefix} ⚠️ Đã cập nhật hh3dData qua window thường.`);
                    }

                    // Cách 3: "Tiêm thuốc" trực tiếp
                    try {
                        const script = document.createElement('script');
                        script.textContent = `
                            try {
                                if (typeof hh3dData !== 'undefined') {
                                    hh3dData.securityToken = "${token}";
                                    console.log('✅ [Inject] Token đã được cập nhật từ bên trong trang web.');
                                }
                            } catch(e) {}
                        `;
                        (document.head || document.body || document.documentElement).appendChild(script);
                        script.remove();
                    } catch (injectErr) {
                        console.warn(`${logPrefix} Lỗi tiêm script:`, injectErr);
                    }
                    // ============================================================
                } else {
                    //  - Token chỉ được trả về cho hàm gọi, không ảnh hưởng trang hiện tại
                    console.log(`${logPrefix} 🛑 Token lấy từ URL khác (${url}). KHÔNG cập nhật hh3dData của trang này.`);
                }

                return token;
            }
            return null;

        } catch (e) {
            console.error(`${logPrefix} ❌ Lỗi:`, e);
            return null;
        }
    }

//Lấy Nonce
    async function getNonce() {       
        if (typeof restNonce !== 'undefined' && restNonce) {
            return restNonce;
        }        

        const scripts = document.querySelectorAll('script');
        for (const script of scripts) {
            let match = script.innerHTML.match(/"restNonce"\s*:\s*"([a-f0-9]+)"/);
            if (match) {
                return match[1];
            } else {
                match = script.innerHTML.match(/"nonce"\s*:\s*"([a-f0-9]+)"/);
                if (match) {
                    return match[1];
                }
            }
        }

        try {
            const nonce = await getSecurityNonce(weburl + '?t', "restNonce");
            if (nonce) {
                return nonce;
            }
        } catch (error) {
            console.error("Failed to get security nonce", error);
        }

        return null;
    }


/**
        * Lấy security nonce một cách chung chung từ một URL.
        *
        * @param {string} url - URL của trang web cần lấy nonce.
        * @param {RegExp} regex - Biểu thức chính quy (regex) để tìm và trích xuất nonce.
        * @returns {Promise<string|null>} Trả về security nonce nếu tìm thấy, ngược lại trả về null.
        */


    async function getSecurityNonce(url, actionName, maxRetries = 3, retryCount = 0) {
        // Sử dụng một tiền tố log cố định cho đơn giản
        const logPrefix = '[HH3D Auto]';

        console.log(`${logPrefix} ▶️ Đang tải trang từ ${url} để lấy security cho action: ${actionName}...`);
        try {
            const response = await fetch(url);
            if (!response.ok) {
                // Kiểm tra lỗi 503 (Service Unavailable) hoặc 429 (Too Many Requests)
                if ((response.status === 503 || response.status === 429) && retryCount < maxRetries) {
                    const waitTime = 2000 + (retryCount * 1000); // 2s, 3s, 4s...
                    console.warn(`${logPrefix} ⚠️ Lỗi ${response.status}, đang thử lại sau ${waitTime/1000}s... (lần ${retryCount + 1}/${maxRetries})`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                    return getSecurityNonce(url, actionName, maxRetries, retryCount + 1);
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const html = await response.text();

            hData = parseHh3dData(html); // Cập nhật hh3dData từ html 
            
            // 🔥 CẬP NHẬT: Trích xuất và cập nhật securityToken nếu có trong HTML
            const tokenRegex = /"securityToken"\s*:\s*"([^"]+)"/;
            const tokenMatch = html.match(tokenRegex);
            if (tokenMatch && tokenMatch[1]) {
                const token = tokenMatch[1];
                console.log(`${logPrefix} 🔑 Phát hiện securityToken mới trong HTML, đang cập nhật...`);

                // Kiểm tra URL có phải trang hiện tại không
                const isCurrentPage = window.location.href.includes(url);

                if (isCurrentPage) {
                    // Cập nhật xuyên sandbox giống getSecurityToken
                    if (typeof unsafeWindow !== 'undefined' && unsafeWindow.hh3dData) {
                        unsafeWindow.hh3dData.securityToken = token;
                        console.log(`${logPrefix} 🔓 Đã cập nhật hh3dData.securityToken thông qua unsafeWindow.`);
                    } else if (typeof window.hh3dData !== 'undefined') {
                        window.hh3dData.securityToken = token;
                        console.log(`${logPrefix} ⚠️ Đã cập nhật hh3dData.securityToken qua window thường.`);
                    } else {
                        // Tiêm script trực tiếp
                        try {
                            const script = document.createElement('script');
                            script.textContent = `
                                try {
                                    if (typeof hh3dData !== 'undefined') {
                                        hh3dData.securityToken = "${token}";
                                        console.log('✅ [Inject] Token đã được cập nhật từ getSecurityNonce.');
                                    }
                                } catch(e) {}
                            `;
                            (document.head || document.body || document.documentElement).appendChild(script);
                            script.remove();
                        } catch (injectErr) {
                            console.warn(`${logPrefix} Lỗi tiêm script:`, injectErr);
                        }
                    }
                }
            }

            // 🆕 Sử dụng extractActionTokens để lấy tất cả action/security pairs
            console.log(`${logPrefix} 🔍 Bắt đầu tìm kiếm security cho action "${actionName}"...`);
            const actionTokens = extractActionTokens(html);
            // console.log(`${logPrefix} 📋 Đã extract được ${Object.keys(actionTokens).length} actions`);
            
            // Tìm security cho action được yêu cầu
            let nonce = actionTokens[actionName];
            if(url.includes('linh-thach')){
                nonce = extractRedeemNonce(html);
            }
            if (nonce) {
                console.log(`${logPrefix} ✅ Lấy được security cho action "${actionName}": ${nonce}`);
                return nonce;
            } else {
                console.error(`${logPrefix} ❌ Không tìm thấy security cho action: ${actionName}`);
                console.log(`${logPrefix} 📋 Các action có sẵn:`, Object.keys(actionTokens).join(', '));
                return null;
            }
        } catch (e) {
            // Kiểm tra nếu là lỗi HTTP 503/429 và còn lượt retry
            if (e.message && (e.message.includes('503') || e.message.includes('429')) && retryCount < maxRetries) {
                const waitTime = 2000 + (retryCount * 1000);
                console.warn(`${logPrefix} ⚠️ ${e.message}, đang thử lại sau ${waitTime/1000}s... (lần ${retryCount + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                return getSecurityNonce(url, actionName, maxRetries, retryCount + 1);
            }
            
            console.error(`${logPrefix} ❌ Lỗi khi tải trang hoặc trích xuất nonce:`, e);
            return null;
        }
    }

    // Lấy ID tài khoản
    async function getAccountId() {
        // Kiểm tra cache trong localStorage
        const cached = localStorage.getItem('hh3d_account_id');
        if (cached) return cached;
        
        const html = document.documentElement.innerHTML;
        const regexList = [
            /"user_id"\s*:\s*"(\d+)"/,       // "user_id":"123"
            /current_user_id\s*:\s*'(\d+)'/  // current_user_id: '123'
        ];

        // --- Thử lấy trực tiếp từ DOM ---
        for (const regex of regexList) {
            const match = html.match(regex);
            if (match) {
                console.log('Lấy account ID trực tiếp từ html');
                localStorage.setItem('hh3d_account_id', match[1]);
                return match[1];
            }
        }

        // --- Fallback: thử fetch trang chính với từng regex ---
        for (const regex of regexList) {
            const id = await getSecurityNonce(weburl + '?t', regex);
            if (id) {
                console.log('Lấy account ID qua fetch fallback');
                localStorage.setItem('hh3d_account_id', id);
                return id;
            }
        }

        return null;
    }


// Lưu trữ trạng thái các hoạt động đã thực hiện
class TaskTracker {
    constructor(storageKey = 'dailyTasks') {
        this.storageKey = storageKey;
        this.data = this.loadData();
        this.dothachTimeoutId = null;
    }
    // Tải dữ liệu từ localStorage
    loadData() {
        const storedData = localStorage.getItem(this.storageKey);
        return storedData ? JSON.parse(storedData) : {};
    }
    // Lưu dữ liệu vào localStorage
    saveData() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    }
        /** Lấy thông tin của một tài khoản cụ thể và tự động cập nhật nếu sang ngày mới
                * @param {string} accountId - ID của tài khoản.
                * @return {object} Trả về dữ liệu tài khoản, bao gồm các nhiệm vụ và trạng thái.
                * Nếu tài khoản chưa có dữ liệu, nó sẽ tự động tạo mới và lưu vào localStorage.
                * Nếu ngày hôm nay đã được cập nhật, nó sẽ reset các nhiệm vụ cho ngày mới.
                * Nếu đã đến giờ chuyển sang lượt 2 của Đổ Thạch, nó sẽ tự động chuyển trạng thái.
            */
        getAccountData(accountId) {
            if (!this.data[accountId]) {
                this.data[accountId] = {};
                this.saveData();
            }

            const accountData = this.data[accountId];
            const today = new Date().toLocaleDateString('vi-VN', {timeZone: 'Asia/Ho_Chi_Minh' });

            // Danh sách tất cả nhiệm vụ mặc định
            const defaultTasks = {
                diemdanh: { done: false },
                thiluyen: { done: false, nextTime: null },
                bicanh: { done: false, nextTime: null },
                phucloi: { done: false, nextTime: null },

                hoangvuc: { done: false, nextTime: null },
                dothach: { betplaced: false, reward_claimed: false, turn: 1 },
                // luanvo: { battle_joined: false, auto_accept: false, done: false },
                khoangmach: {done: false, nextTime: null },
                tienduyen: {last_check: null, done: false },
                hoatdongngay: {done: false },
                luotkhactranvip: {done: false },
                phaptuong: {done: false }
            };

            if (accountData.lastUpdatedDate !== today) {
                console.log(`[TaskTracker] Cập nhật dữ liệu ngày mới cho tài khoản: ${accountId}`);
                accountData.lastUpdatedDate = today;
                // Reset toàn bộ nhiệm vụ
                Object.assign(accountData, defaultTasks);
                this.saveData();
            } else {
                // Ngày chưa đổi → merge các nhiệm vụ mới
                let updated = false;
                for (const taskName in defaultTasks) {
                    if (!accountData[taskName]) {
                        accountData[taskName] = defaultTasks[taskName];
                        updated = true;
                    }
                }
                if (updated) this.saveData();
            }
            // Xử lý Đổ Thạch lượt 2
            const now = new Date();
            const hourInVN = parseInt( new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh', hour: 'numeric', hour12: false }), 10);
            if (accountData.dothach.turn === 1 && hourInVN >= 16) {
                accountData.dothach = {
                    betplaced: false,
                    reward_claimed: false,
                    turn: 2,
                };
                this.saveData();
            }
            // Lên lịch tự động reset vào 16h hàng ngày nếu chưa có timer
            if (!this.dothachTimeoutId) {
                const now = new Date();

                // Tạo danh sách mốc reset theo thứ tự
                const resetTimes = [
                    new Date(now.getFullYear(), now.getMonth(), now.getDate(), 16, 1, 0, 0), // 16h hôm nay
                    new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 1, 0, 0, 0) // 01h sáng mai
                ];

                // Tìm mốc reset gần nhất so với hiện tại
                let nextResetTime = resetTimes.find(t => t > now);
                if (!nextResetTime) {
                    // Nếu đã qua tất cả mốc → chọn 16h ngày mai
                    nextResetTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 16, 0, 0, 0);
                }

                const timeToWait = nextResetTime - now;

                console.log(`[TaskTracker] Reset sau ${Math.floor(timeToWait / 1000 / 60) } phút.`);

                this.dothachTimeoutId = setTimeout(() => { this.getAccountData(accountId); }, timeToWait);
            }

            return accountData;
        }
        /**
        * Cập nhật một thuộc tính cụ thể của một nhiệm vụ.
        * @param {string} accountId - ID của tài khoản.
        * @param {string} taskName - Tên nhiệm vụ (ví dụ: 'dothach').
        * @param {string} key - Tên thuộc tính cần cập nhật (ví dụ: 'betplaced').
        * @param {*} value - Giá trị mới cho thuộc tính.
        */
        updateTask(accountId, taskName, key, value) {
            const accountData = this.getAccountData(accountId);
            if (accountData[taskName]) {
                accountData[taskName][key ] = value;
                this.saveData();
            } else {
                console.error(`[TaskTracker] Nhiệm vụ "${taskName}" không tồn tại cho tài khoản "${accountId}"`);
            }
        }
        /** Lấy thông tin task
        * @param {string} accountId - ID của tài khoản.
        * @param {string} taskName - Tên nhiệm vụ: 'diemdanh', 'thiluyen', 'bicanh', 'phucloi', 'hoangvuc'.
        * @return {object|null} Trả về đối tượng nhiệm vụ hoặc null nếu không tồn tại.
        * Ví dụ:  getTaskStatus('123', 'luanvo').battle_joined => 'true'
        */
        getTaskStatus(accountId, taskName) {
            const accountData = this.getAccountData(accountId);
            return accountData[taskName] || null;
        }
        /**
        * Kiểm tra xem một nhiệm vụ đã hoàn thành hay chưa
        * @param {string} accountId - ID của tài khoản.
        * @param {string} taskName - Tên nhiệm vụ: 'diemdanh', 'thiluyen', 'bicanh', 'phucloi', 'hoangvuc'.
        * @return {boolean} Trả về `true` nếu nhiệm vụ đã hoàn thành, ngược lại là `false`.
        */
        isTaskDone(accountId, taskName) {
            const accountData = this.getAccountData(accountId);
            return accountData[taskName] && accountData[taskName].done;
        }
        /**
        * Đánh dấu một nhiệm vụ là đã hoàn thành
        * @param {string} accountId - ID của tài khoản.
        * @param {string} taskName - Tên nhiệm vụ: 'diemdanh', 'thiluyen', 'bicanh', 'phucloi', 'hoangvuc'.
        * @return {void}
        */
        markTaskDone(accountId, taskName) {
            const accountData = this.getAccountData(accountId);
            if (accountData[taskName]) {
                accountData[taskName].done = true;
                this.saveData();
            } else {
                        console.error(`[TaskTracker] Nhiệm vụ "${taskName}" không tồn tại cho tài khoản "${accountId}"`);
            }
        }
        /**
        * Bỏ đánh dấu một nhiệm vụ đã hoàn thành
        * @param {string} accountId - ID của tài khoản.
        * @param {string} taskName - Tên nhiệm vụ.
        * @return {void}
        */
        unmarkTaskDone(accountId, taskName) {
            const accountData = this.getAccountData(accountId);
            if (accountData[taskName]) {
                accountData[taskName].done = false;
                this.saveData();
            } else {
                console.error(`[TaskTracker] Nhiệm vụ "${taskName}" không tồn tại cho tài khoản "${accountId}"`);
            }
        }
        /**
        * Reset tất cả trạng thái hoàn thành của các nhiệm vụ
        * @param {string} accountId - ID của tài khoản.
        * @return {void}
        */
        resetAllTasks(accountId) {
            const accountData = this.getAccountData(accountId);
            const taskNames = ['diemdanh', 'thiluyen', 'bicanh', 'phucloi', 'hoangvuc', 'khoangmach', 'hoatdongngay', 'tienduyen', 'luotkhactranvip', 'phaptuong'];
            let resetCount = 0;
            taskNames.forEach(taskName => {
                if (accountData[taskName] && accountData[taskName].done) {
                    accountData[taskName].done = false;
                    resetCount++;
                }
            });
            // Reset đổ thạch về trạng thái ban đầu
            if (accountData.dothach) {
                accountData.dothach.betplaced = false;
                accountData.dothach.reward_claimed = false;
            }
            this.saveData();
            console.log(`[TaskTracker] Đã reset ${resetCount} nhiệm vụ cho tài khoản ${accountId}`);
            return resetCount;
        }
        /**
        * Điều chỉnh thời gian của một nhiệm vụ
        * @param {string} accountId - ID của tài khoản.
        * @param {string} taskName - Tên nhiệm vụ: 'thiluyen', 'bicanh', 'phucloi', 'hoangvuc'.
        * @param {string} newTime - Thời gian mới theo định dạng timestamp.
        * @return {void}
        */
        adjustTaskTime(accountId, taskName, newTime) {
        //console.log(`[TaskTracker] adjustTaskTime called for ${taskName}, newTime=`, newTime, "stack=", new Error().stack);
        const accountData = this.getAccountData(accountId);
        if (accountData[taskName]) {
            accountData[taskName].nextTime = newTime;
            this.saveData();
        } else {
            console.error(`[TaskTracker] Nhiệm vụ "${taskName}" không tồn tại cho tài khoản "${accountId}"`);
        }
    }

    getNextTime(accountId, taskName) {
        const accountData = this.getAccountData(accountId);
        const ts = accountData[taskName]?.nextTime;
        if (!ts || ts === "null") {
            return null; // chưa có thời gian
        }
        const date = new Date(Number(ts));
        return isNaN(date.getTime()) ? null : date;
    }
    /** Return dạng Date */
    getLastCheckTienDuyen(accountId) {
        const accountData = this.getTaskStatus(accountId, 'tienduyen');
        const timestamp = Number(accountData.last_check); // Chuyển chuỗi miligiây thành số
        return new Date(timestamp); // Tạo đối tượng Date
    }
    /** Lấy cả timstamp dạng string hay Date đều được */
    setLastCheckTienDuyen(accountId, timestamp) {
        let finalTimestamp = timestamp; // Khởi tạo biến lưu giá trị cuối cùng
        // Kiểm tra nếu timestamp là một đối tượng Date
        if (timestamp instanceof Date) {
            finalTimestamp = timestamp.getTime(); // Lấy giá trị timestamp dạng số
        } else if (typeof timestamp === 'string') {
            finalTimestamp = Number(timestamp); // Chuyển chuỗi thành số
        }
        this.updateTask(accountId, 'tienduyen', 'last_check', finalTimestamp);
    }
}
/**
        * Cộng thêm phút và giây vào thời điểm hiện tại và trả về một đối tượng Date mới.
        * @param {string} timeString - Chuỗi thời gian định dạng "mm:ss" (phút:giây).
        * @returns {Date} - String dạng timestamp cho thời gian được cộng thêm
        */

    function timePlus(timeString) {
        const now = new Date();
        const [minutes, seconds] = timeString.split(':').map(Number);
        const millisecondsToAdd = (minutes * 60 + seconds) * 1000;
        return now.getTime() + millisecondsToAdd;
        }

    // ===============================================
    // ĐỊNH NGHĨA CÁC NHIỆM VỤ / QUEST CONFIGURATION
    // ===============================================
    const QUEST_CONFIG = [
        {
            taskId: 'diemdanh',
            taskName: 'Điểm Danh, Tế Lễ, Vấn Đáp',
            taskIcon: '<i class="fas fa-calendar-check"></i>',
            autorunEnabled: true,
            autorunKey: 'autoDiemDanh',
            hasButton: true,
            buttonText: 'Thực hiện',
            async action() {
                const nonce = await getNonce();
                if (!nonce) {
                    showNotification("Không tìm thấy nonce! Vui lòng tải lại trang.", "error");
                    return;
                }
                await doDailyCheckin(nonce);
                await doClanDailyCheckin(nonce);
                await vandap.doVanDap(nonce);
                console.log("[HH3D Script] ✅ Điểm danh, tế lễ, vấn đáp đã hoàn thành.");
            }
        },
        {
            taskId: 'thiluyen',
            taskName: 'Thí Luyện Tông Môn',
            taskIcon: '<i class="fas fa-fire-alt"></i>',
            autorunEnabled: true,
            autorunKey: 'autoThiLuyen',
            hasButton: true,
            buttonText: 'Thực hiện',
            async action() {
                await doThiLuyenTongMon();
                console.log("[HH3D Script] ✅ Thí Luyện Tông Môn đã hoàn thành.");
            }
        },
        {
            taskId: 'phucloi',
            taskName: 'Phúc Lợi Đường',
            taskIcon: '<i class="fas fa-gift"></i>',
            autorunEnabled: true,
            autorunKey: 'autoPhucLoi',
            hasButton: true,
            buttonText: 'Nhận',
            hasExtraButton: true,
            extraButtonText: '🎁',
            extraButtonTitle: 'Nhận Bonus',
            async action() {
                await doPhucLoiDuong();
                console.log("[HH3D Script] ✅ Phúc Lợi đã hoàn thành.");
            },
            async extraAction() {
                await phucloiclaimbonus();
                console.log("[HH3D Script] ✅ Nhận thưởng Bonus Phúc Lợi đã chạy.");
            }
        },
        {
            taskId: 'hoangvuc',
            taskName: 'Hoang Vực',
            taskIcon: '<i class="fas fa-dragon"></i>',
            autorunEnabled: true,
            autorunKey: 'autoHoangVuc',
            hasButton: true,
            buttonText: 'Đánh',
            hasExtraButton: true,
            extraButtonText: '📦',
            extraButtonTitle: 'Mua 5 Rương Linh Bảo',
            hasSettings: true,
            hasDamageToggle: true,
            async action() {
                await hoangvuc.doHoangVuc();
            },
            async extraAction() {
                await hvmuaruong.muaRuongLinhBao(5);
            }
        },
        // {
        //     taskId: 'luanvo',
        //     taskName: 'Luận Võ',
        //     taskIcon: '<i class="fas fa-trophy"></i>',
        //     autorunEnabled: true,
        //     autorunKey: 'autoLuanVo',
        //     hasButton: true,
        //     buttonText: 'Đấu',
        //     hasCustomControls: true,
        //     async action() {
        //         const autoChallenge = localStorage.getItem('luanvo_auto_challenge') !== '0';
        //         await luanvo.doLuanVo(autoChallenge);
        //     }
        // },
        {
            taskId: 'khoangmach',
            taskName: 'Khoáng Mạch',
            taskIcon: '<i class="fas fa-gem"></i>',
            autorunEnabled: true,
            autorunKey: 'autoKhoangMach',
            hasButton: true,
            buttonText: 'Đào',
            hasSettings: true,
            hasExtraButton: true,
            extraButtonText: 'Vào',
            extraButtonTitle: 'Vào Khoáng Mạch',
            async extraAction() {
                window.location.href = '/khoang-mach';
            },
            async action() {
                await khoangmach.doKhoangMach();
            }
        },
        {
            taskId: 'kmsearch',
            taskName: 'Tìm Kẻ Địch',
            taskIcon: '<i class="fas fa-search"></i>',
            hasCustomControls: true,
            hasSettings: true,
        },
        {
            taskId: 'dothach',
            taskName: 'Đổ Thạch',
            taskIcon: '<i class="fas fa-dice"></i>',
            autorunEnabled: true,
            autorunKey: 'autoDoThach',
            hasButton: true,
            buttonText: 'Cược',
            hasSelect: true,
            selectOptions: [
                { value: 'tai', label: 'Tài' },
                { value: 'xiu', label: 'Xỉu' }
            ],
            async action() {
                const choice = localStorage.getItem('dice-roll-choice') || 'tai';
                await dothach.run(choice);
            }
        },
        {
            taskId: 'bicanh',
            taskName: 'Bí Cảnh',
            taskIcon: '<i class="fas fa-skull-crossbones"></i>',
            autorunEnabled: true,
            autorunKey: 'autoBiCanh',
            hasButton: true,
            buttonText: 'Đánh',
            hasInput: true,
            inputType: 'number',
            inputMin: 0,
            inputMax: 5,
            inputTitle: 'Số lượt giữ lại',
            hasToggle: true,
            toggleTitle: 'Theo dõi boss qua socket',
            async action() {
                await bicanh.doBiCanh();
            }
        },

        {
            taskId: 'tienduyen',
            taskName: 'Tiên Duyên',
            taskIcon: '<i class="fas fa-heart"></i>',
            autorunEnabled: true,
            autorunKey: 'autoTienDuyen',
            hasButton: true,
            buttonText: 'Thực hiện',
            hasExtraButton: true,
            extraButtonText: '🙏',
            extraButtonTitle: 'Cầu Nguyện Đạo Lữ',
            hasExtra2Button: true,
            extra2ButtonText: '🌺',
            extra2ButtonTitle: 'Tặng Hoa',
            hasSelect: true,
            selectOptions: [
                { value: '1', label: 'tặng 1ng' },
                { value: '2', label: 'tặng 2ng' },
                { value: '3', label: 'tặng 3ng' },
                { value: '4', label: 'tặng 4ng' },
                { value: '5', label: 'tặng 5ng' }
            ],
            async action() {
                await tienduyen.doTienDuyen();
            },
            async extraAction() {
                const accountId = await getAccountId();
                await docaunguyen(accountId);
            },
            async extra2Action() {
                const quantity = parseInt(localStorage.getItem('tienduyen-choice') || '5', 10);
                if (!tanghoa.initialized) await tanghoa.init();
                await tanghoa.run(quantity);
            }
        },
        {
            taskId: 'phaptuong',
            taskName: 'Pháp Tướng',
            taskIcon: '<i class="fas fa-fire"></i>',
            autorunEnabled: true,
            autorunKey: 'autoKhacTranVip',
            hasButton: true,
            buttonText: 'Khắc',
            hasExtraButton: true,
            extraButtonText: 'VIP',
            extraButtonTitle: 'Nhận lượt Khắc Trận VIP',
            async action() {
                await khactran.autoActivateSeal();
            },
            async extraAction() {
                const accountId = await getAccountId();
                await khactran.claimDailyTurns(accountId);
            }
        },
        {
            taskId: 'muadan',
            taskName: 'Mua Đan Dược',
            taskIcon: '<i class="fas fa-flask"></i>',
            hasCustomControls: true,
        },
        {
            taskId: 'hoatdongngay',
            taskName: 'Hoạt Động Ngày - Vòng Quay',
            taskIcon: '<i class="fas fa-calendar-day"></i>',
            hasButton: true,
            buttonText: 'Mở',
            async action() {
                await hoatdongngay.doHoatDongNgay();
            }
        }
    ];

    // ===============================================
    // TẠO SKELETON UI CHO DANH SÁCH NHIỆM VỤ
    // ===============================================
    function createQuestSkeletonUI() {
        const questsHTML = QUEST_CONFIG.map(quest => {
            const extraControls = [];
            
            // Thêm select nếu có
            if (quest.hasSelect) {
                const savedValue = localStorage.getItem(`${quest.taskId}-choice`) || quest.selectOptions[quest.selectOptions.length - 1].value;
                const optionsHTML = quest.selectOptions.map(opt => 
                    `<option value="${opt.value}" ${opt.value === savedValue ? 'selected' : ''}>${opt.label}</option>`
                ).join('');
                extraControls.push(`<select class="quest-select" data-task="${quest.taskId}">${optionsHTML}</select>`);
            }

            // Thêm input nếu có  
            if (quest.hasInput) {
                const savedValue = localStorage.getItem(`reserve${quest.taskId.charAt(0).toUpperCase() + quest.taskId.slice(1)}Attacks`) || '0';
                extraControls.push(`<input type="${quest.inputType}" class="quest-input" data-task="${quest.taskId}" 
                    min="${quest.inputMin}" max="${quest.inputMax}" value="${savedValue}" 
                    title="${quest.inputTitle}" />`);
            }

            // Thêm toggle nếu có
            if (quest.hasToggle) {
                const savedState = localStorage.getItem(`${quest.taskId}SocketEnabled`);
                const isEnabled = savedState === '1';
                extraControls.push(`<button class="quest-toggle" data-task="${quest.taskId}" 
                    title="${quest.toggleTitle}">${isEnabled ? '🔔' : '🔕'}</button>`);
                 // Apply socket changes immediately
                if (isEnabled) {
                    if (typeof bicanhhiente !== 'undefined' && bicanhhiente.startBossSocketListener) {
                        bicanhhiente.startBossSocketListener();
                    }
                } else {
                    if (typeof bicanhhiente !== 'undefined' && bicanhhiente.stopBossSocketListener) {
                        bicanhhiente.stopBossSocketListener();
                    }
                } 
            }

            // Thêm settings button nếu có
            if (quest.hasSettings) {
                extraControls.push(`<button class="quest-settings-btn" data-task="${quest.taskId}" title="Cài đặt">⚙️</button>`);
            }

            // Thêm toggle tối ưu hóa sát thương (Hoang Vực)
            if (quest.hasDamageToggle) {
                const dmgOn = localStorage.getItem('hoangvucMaximizeDamage') === 'true';
                extraControls.push(`<button class="quest-toggle hoangvuc-damage-toggle" title="Tối ưu hóa sát thương" style="background:${dmgOn ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.05)'};color:${dmgOn ? '#22c55e' : '#9ca3af'};font-size:10px;font-weight:700;min-width:34px">${dmgOn ? '+15%' : '0%'}</button>`);
            }

            // Tạo nút chính
            let buttonHTML = '';
            if (quest.hasButton) {
                buttonHTML = `<button class="quest-action-btn" data-task="${quest.taskId}">${quest.buttonText}</button>`;
            }

            // Custom controls: Luận Võ inline mode + target ID
            // if (quest.hasCustomControls && quest.taskId === 'luanvo') {
            //     const lvMode = localStorage.getItem('luanVoChallengeMode') || 'auto';
            //     const lvTargetId = localStorage.getItem(`luanVoTargetUserId_${accountId}`) || '';
            //     buttonHTML = `
            //         <select class="quest-select luanvo-mode-select" title="Chế độ thách đấu">
            //             <option value="auto" ${lvMode !== 'manual' ? 'selected' : ''}>Tự động</option>
            //             <option value="manual" ${lvMode === 'manual' ? 'selected' : ''}>Nhập ID</option>
            //         </select>
            //         <input type="text" class="quest-input luanvo-target-input" placeholder="ID đối thủ"
            //                value="${lvTargetId}"
            //                style="display:${lvMode === 'manual' ? 'inline-block' : 'none'};width:70px">
            //     ` + buttonHTML;
            // }

            // Custom controls: Mua Đan
            if (quest.hasCustomControls && quest.taskId === 'muadan') {
                const savedN = localStorage.getItem('mua-dan-choice') || '3';
                const tubao = localStorage.getItem('tubaoChecked') === 'true';
                const opts = [1,2,3,4,5].map(n => `<option value="${n}" ${String(n)===savedN?'selected':''}>${n}</option>`).join('');
                buttonHTML = `
                    <select class="quest-select muadan-count-select" title="Số đan Tông Môn">${opts}</select>
                    <button class="quest-action-btn muadan-tong-btn" data-task="muadan">🍱 Tông</button>
                    <button class="quest-action-btn muadan-tubao-btn" data-task="muadan" style="background:${tubao?'linear-gradient(135deg,#f093fb,#f5576c)':'#555'}">🧄 Tụ Bảo</button>
                `;
            }

            // Custom controls: Tìm kiếm kẻ địch (Khoáng Mạch)
            if (quest.hasCustomControls && quest.taskId === 'kmsearch') {
                const hasResults = !!sessionStorage.getItem('khoangmach_enemy_search_results');
                buttonHTML = `
                    <button class="quest-action-btn km-search-start-btn">🔍 Tìm</button>
                    <button class="quest-action-btn km-search-view-btn" ${!hasResults ? 'disabled' : ''}>📊 Kết quả</button>
                `;
            }

            // Tạo nút extra nếu có
            if (quest.hasExtraButton) {
                buttonHTML += `<button class="quest-extra-btn" data-task="${quest.taskId}" title="${quest.extraButtonTitle}">${quest.extraButtonText}</button>`;
            }

            // Tạo nút extra2 nếu có
            if (quest.hasExtra2Button) {
                buttonHTML += `<button class="quest-extra-btn quest-extra2-btn" data-task="${quest.taskId}" title="${quest.extra2ButtonTitle}">${quest.extra2ButtonText}</button>`;
            }

            // Thêm indicator dot nếu quest có thể autorun
            let indicatorHTML = '';
            if (quest.autorunEnabled) {
                const isEnabled = localStorage.getItem(quest.autorunKey) !== '0';
                indicatorHTML = `<span class="quest-autorun-indicator ${isEnabled ? 'enabled' : 'disabled'}" data-task="${quest.taskId}"></span>`;
            }

            return `
                <div class="nv-quest-item" data-task-id="${quest.taskId}">
                    ${indicatorHTML}
                    <span class="nv-quest-icon" data-task="${quest.taskId}" style="cursor: ${quest.autorunEnabled ? 'pointer' : 'default'};" title="${quest.autorunEnabled ? 'Bấm để bật/tắt chạy tự động' : ''}">${quest.taskIcon}</span>
                    <span class="nv-quest-name">${quest.taskName}<span class="quest-progress" style="color:#9ca3af;font-size:10px;"></span></span>
                    <div class="quest-controls">
                        ${extraControls.join('')}
                        ${buttonHTML}
                    </div>
                    <div class="quest-next-time" data-task="${quest.taskId}"></div>
                </div>
            `;
        }).join('');

        return `
            <div class="nv-overview">
                <div class="nv-ov-header">
                    <h3>Nhiệm Vụ</h3>
                    <span class="quest-next-time" data-task="restart" style="font-size:10px;color:#9ca3af;flex-shrink:0;margin-right:5px"></span>
                    <span class="percent">0%</span>
                </div>
                <div class="nv-progress-bar">
                    <div class="nv-progress-fill" style="width: 0%"></div>
                </div>
                <p class="nv-ov-summary">0/5 nhiệm vụ</p>
                <div class="nv-chips"></div>
                <button class="progress-toggle-btn" onclick="
                    const details = document.querySelector('.nv-quest-details');
                    if(details) {
                        details.classList.toggle('show');
                        this.textContent = details.classList.contains('show') ? '▲ Ẩn chi tiết' : '▼ Xem chi tiết';
                    }
                ">▼ Xem chi tiết</button>
            </div>
            <div class="nv-quest-details ">${questsHTML}</div>
        `;
    }

        /* ===== Update Profile Info ===== */
async function loadHH3DProfile() {
  // Xu
    try {
        const res = await fetch("/vip-hh3d", { credentials: "include" });
        const html = await res.text();
        //console.log("HTML /vip-hh3d:", html); // log toàn bộ HTML trả về

        const xuMatch = html.match(/id="current-coins">([\d.,]+)/); // bắt cả số có dấu . hoặc ,
        const xukhoaMatch = html.match(/id="current-coins-locked">([\d.,]+)/);

        //console.log("xuMatch:", xuMatch);
        //console.log("xukhoaMatch:", xukhoaMatch);

        const xu = xuMatch ? xuMatch[1] : "?";
        const xukhoa = xukhoaMatch ? xukhoaMatch[1] : "?";

        //console.log("Parsed Xu:", xu);
        //console.log("Parsed Xu Khóa:", xukhoa);

        document.getElementById("xu-info").innerHTML = `        
            <div class="xu-display">
                <span class="xu-left">🪙 Xu: <strong>${xu}</strong> 🔒 <strong>${xukhoa}</strong></span>
                <span class="xu-right">
                    <span class="autorun-indicator-dot"></span>
                    <span class="autorun-icon" title="Bấm để bật/tắt tự động chạy khi tải trang"><i class="fas fa-robot"></i></span>           
                    <button id="autorun-main-btn" class="autorun-main-btn">Bắt Đầu</button>
                    <button id="profile-refresh-btn" title="Làm mới thông tin">🔄</button>
                </span>
            </div>        
            <div id="promo-form" class="promo-form">
                <input type="text" id="promo-code-input" placeholder="Nhập CODE" value="" />
                <button id="promo-code-submit">💎 Hấp Thụ</button>
                <button id="settings-btn" class="settings-btn" title="Cài đặt chung">⚙️</button>
                <button id="guide-btn" class="settings-btn" title="Hướng dẫn sử dụng">❓</button>
            </div>
        `;
        const refreshBtn = document.getElementById('profile-refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', async () => {
                refreshBtn.textContent = '⟳';
                refreshBtn.disabled = true;
                await loadHH3DProfile();
                refreshBtn.textContent = '🔄';
                refreshBtn.disabled = false;
                showNotification('Đã làm mới thông tin nhiệm vụ hàng ngày.', 'success', 2000);
            });
        }
        // Bind autorun button in xu-info
        const autorunBtn = document.getElementById('autorun-main-btn');
        if (autorunBtn) {
            autorunBtn.addEventListener('click', async () => {
                // let enabled = localStorage.getItem('isRunning') !== '0';                
                if (!window.isRunning) {
                    autorunBtn.classList.add('running');
                    autorunBtn.textContent = 'Dừng Lại';
                    if (window.hh3dAutomatic) {
                        await window.hh3dAutomatic.start();
                    }
                    window.isRunning = true;
                    showNotification('Bắt đầu chạy tự động', 'info');
                } else {
                    autorunBtn.classList.remove('running');
                    autorunBtn.textContent = 'Bắt Đầu';
                    if (window.hh3dAutomatic) {
                        await window.hh3dAutomatic.stop();
                    }
                    window.isRunning = false;
                    showNotification('Đã dừng chạy tự động', 'info');
                }           
            });
        }
        
        // Gắn sự kiện
        setTimeout(() => {
            const promoSubmit = document.getElementById('promo-code-submit');
            const promoInput = document.getElementById('promo-code-input');
            
            // Submit code
            if (promoSubmit && promoInput) {
                promoSubmit.addEventListener('click', async () => {
                    const code = promoInput.value.trim();
                    if (!code) {
                        showNotification('⚠️ Vui lòng nhập mã CODE', 'warning');
                        return;
                    }
                    localStorage.setItem('hh3d_promo_code', code);
                    await submitPromoCode(code);
                });
                
                // Nhấn Enter cũng submit
                promoInput.addEventListener('keypress', async (e) => {
                    if (e.key === 'Enter') {
                        const code = promoInput.value.trim();
                        if (code) {
                            localStorage.setItem('hh3d_promo_code', code);
                            await submitPromoCode(code);
                        }
                    }
                });
            }
            
            // Autorun icon toggle
            const autorunIcon = document.querySelector('.autorun-icon');
            const autorunDot = document.querySelector('.autorun-indicator-dot');
            if (autorunIcon && autorunDot) {
                // Initialize state
                let autorunEnabled = localStorage.getItem('autorunEnabled') !== '0';
                autorunDot.classList.toggle('enabled', autorunEnabled);
                autorunDot.classList.toggle('disabled', !autorunEnabled);
                
                autorunIcon.addEventListener('click', () => {
                    autorunEnabled = !autorunEnabled;
                    localStorage.setItem('autorunEnabled', autorunEnabled ? '1' : '0');
                    autorunDot.classList.toggle('enabled', autorunEnabled);
                    autorunDot.classList.toggle('disabled', !autorunEnabled);
                    autorunIcon.classList.toggle('enabled', autorunEnabled);
                    autorunIcon.classList.toggle('disabled', !autorunEnabled);
                        
                    const message = autorunEnabled ? 'Tự động chạy khi tải trang đã được bật' : 'Tự động chạy khi tải trang đã được tắt';
                    showNotification(message, 'info');
                });
                // Robot icon reflects autorunEnabled (auto-start on page load)
                autorunIcon.classList.toggle('enabled', autorunEnabled);
                autorunIcon.classList.toggle('disabled', !autorunEnabled);
                // Button reflects actual running state (window.isRunning)
                if (window.isRunning) {
                    autorunBtn.classList.add('running');
                    autorunBtn.textContent = 'Dừng Lại';
                } else {
                    autorunBtn.classList.remove('running');
                    autorunBtn.textContent = 'Bắt Đầu';
                }
            }
            const settingsBtn = document.getElementById('settings-btn');
            if (settingsBtn) {
                settingsBtn.addEventListener('click', () => {
                    showQuestSettings();
                });
            }
            const guideBtn = document.getElementById('guide-btn');
            if (guideBtn) {
                guideBtn.addEventListener('click', () => {
                    showGuideModal();
                });
            }        
        }, 100);
    } catch (e) {
    console.error("Error fetching Xu:", e);
    }

    // Tiến độ - Cập nhật dữ liệu vào skeleton UI
    try {
        const html = await (await fetch("/nhiem-vu-hang-ngay", { credentials: "include" })).text();
        const doc = new DOMParser().parseFromString(html, "text/html");
        
        // Parse tiến độ
        const ringLabel = doc.querySelector(".nv-ring-label");
        const percent = ringLabel ? ringLabel.textContent.trim() : "0%";
        const percentValue = parseInt(percent) || 0;
        
        // Parse thông tin nhiệm vụ
        const heading = doc.querySelector(".nv-ov-right h3");
        const summary = doc.querySelector(".nv-ov-right p");
        const headingText = heading ? heading.textContent.trim() : "Nhiệm Vụ";
        const summaryText = summary ? summary.textContent.trim() : "0/5 nhiệm vụ";
        
        // Parse danh sách nhiệm vụ từ chips
        const chips = [...doc.querySelectorAll(".nv-chip")];
        const chipsHTML = chips.map(chip => {
            const isDone = chip.classList.contains("chip-done");
            const text = chip.textContent.trim();
            return `<span class="nv-chip ${isDone ? 'chip-done' : 'chip-pend'}">${text}</span>`;
        }).join('');
        
        const isFull = percentValue >= 100;
        
        // Cập nhật UI Overview (không tạo mới)
        const progressWrap = document.getElementById("reward-progress-wrap");
        if (progressWrap) {
            // Cập nhật các phần tử đã có
            const percentElem = progressWrap.querySelector('.percent');
            const progressFill = progressWrap.querySelector('.nv-progress-fill');
            const summaryElem = progressWrap.querySelector('.nv-ov-summary');
            const chipsContainer = progressWrap.querySelector('.nv-chips');
            const headingElem = progressWrap.querySelector('.nv-ov-header h3');
            
            if (percentElem) {
                percentElem.textContent = percent;
                percentElem.className = `percent ${isFull ? 'full' : ''}`;
            }
            if (progressFill) {
                progressFill.style.width = percent;
                progressFill.className = `nv-progress-fill ${isFull ? 'full' : ''}`;
            }
            if (summaryElem) summaryElem.textContent = summaryText;
            if (chipsContainer) chipsContainer.innerHTML = chipsHTML;
            if (headingElem) headingElem.textContent = headingText;
        }
        
        // Parse danh sách nhiệm vụ chi tiết từ server và cập nhật trạng thái
        const quests = [...doc.querySelectorAll(".nv-quest")];
        
        // Gom progress theo từng quest item trong UI
        const questItems = document.querySelectorAll('.nv-quest-item');
        questItems.forEach(item => {
            const itemName = item.querySelector('.nv-quest-name')?.textContent.trim() || "";
            const itemParts = itemName.split(',').map(s => s.trim());
            const progressParts = [];
            let allDone = true;
            let anyMatch = false;
            
            quests.forEach(quest => {
                const isDone = quest.classList.contains("done");
                const name = quest.querySelector(".nv-qb h4")?.textContent.trim() || "";
                const progress = quest.querySelector(".nv-prog-txt")?.textContent.trim() || "";
                
                if (itemName.includes(name) || name.includes(itemName.split('<')[0].trim()) || itemParts.some(part => name.includes(part))) {
                    anyMatch = true;
                    if (!isDone) allDone = false;
                    if (progress) progressParts.push(progress);
                }
            });
            
            if (anyMatch) {
                if (allDone) {
                    item.classList.add('done');
                } else {
                    item.classList.remove('done');
                }
                const progressSpan = item.querySelector('.quest-progress');
                if (progressSpan && progressParts.length > 0) {
                    let progressText = '';
                    if (progressParts.length > 1) {
                        let curSum = 0, maxSum = 0;
                        progressParts.forEach(p => {
                            const m = p.match(/(\d+)\s*\/\s*(\d+)/);
                            if (m) { curSum += parseInt(m[1]); maxSum += parseInt(m[2]); }
                        });
                        progressText = maxSum > 0 ? ` ${curSum}/${maxSum}` : ` ${progressParts.join(' | ')}`;
                    } else {
                        progressText = ` ${progressParts[0]}`;
                    }
                    // Nếu là Bí Cảnh và có window.bicanhBossHp thì append phần trăm máu boss
                    if (item.dataset.taskId === 'bicanh' && typeof window.bicanhBossHp === 'number') {
                        progressText += ` (${window.bicanhBossHp.toFixed(2)}% HP)`;
                    }
                    progressSpan.textContent = progressText;
                }
            }
        });
        
        // Cập nhật trạng thái nút dựa trên taskTracker
        await updateAllQuestButtons();
        
    } catch (e) {
        console.error("Error loading progress:", e);
        const progressWrap = document.getElementById("reward-progress-wrap");
        if (progressWrap && !progressWrap.querySelector('.nv-quest-details')) {
            // Chỉ hiển thị lỗi nếu chưa có skeleton
            progressWrap.innerHTML = `
            <div style="font-size:12px;color:#999;">
                ⚠️ Không thể tải tiến độ
            </div>
            `;
        }
    }
}

// ===============================================
// CẬP NHẬT TRẠNG THÁI TẤT CẢ CÁC NÚT NHIỆM VỤ
// ===============================================
async function updateAllQuestButtons() {
    const accountId = await getAccountId();
    if (!accountId) return;
    
    QUEST_CONFIG.forEach(async (quest) => {
        const button = document.querySelector(`.quest-action-btn[data-task="${quest.taskId}"]`);
        if (!button) return;
        
        const questItem = document.querySelector(`.nv-quest-item[data-task-id="${quest.taskId}"]`);
        
        // Xử lý từng loại task
        switch (quest.taskId) {
            case 'diemdanh':
            case 'thiluyen':
            case 'phucloi':
            case 'hoangvuc':
            // case 'luanvo':
            case 'khoangmach':
            case 'luotkhactranvip':
            case 'tienduyen':
            case 'phaptuong':
            case 'hoatdongngay':
                if (taskTracker.isTaskDone(accountId, quest.taskId)) {
                    // button.disabled = true;
                    button.textContent = '✓ Xong';
                    // nếu đã hoàn thành thì dừng countdown timer
                    countdownTimer.remove(quest.taskId);
                    if (questItem) questItem.classList.add('done');
                } else {
                    // button.disabled = false;
                    button.textContent = quest.buttonText;
                    if (questItem) questItem.classList.remove('done');
                }
                break;
                
            case 'dothach':
                const currentHour = parseInt(new Date().toLocaleString('en-US', {
                    timeZone: 'Asia/Ho_Chi_Minh',
                    hour: 'numeric',
                    hour12: false
                }), 10);
                const isBetTime = (currentHour >= 6 && currentHour < 13) || (currentHour >= 16 && currentHour < 21);
                const status = taskTracker.getTaskStatus(accountId, 'dothach');
                if ((status.betplaced && isBetTime) || (status.reward_claimed && !isBetTime)) {
                    // button.disabled = true;
                    button.textContent = '✓ Xong';
                } else {
                    // button.disabled = false;
                    button.textContent = quest.buttonText;
                }
                break;
                
            case 'bicanh':
                const isDailyLimit = await bicanh.isDailyLimit();
                if (isDailyLimit) {
                    // button.disabled = true;
                    button.textContent = '✓ Xong';
                    countdownTimer.remove('bicanh');
                    if (questItem) questItem.classList.add('done');
                } else {
                    // button.disabled = false;
                    button.textContent = quest.buttonText;
                    if (questItem) questItem.classList.remove('done');
                }
                break;
                

            case 'phaptuong':
                const isOutTurns = await khactran.checkRemainingTurns();
                const today = new Date().toDateString();
                const lastday = localStorage.getItem('phaptuong_lastday');
                
                if (lastday !== today) {
                    button.textContent = quest.buttonText;
                    if (questItem) questItem.classList.remove('done');
                    localStorage.setItem('phaptuong_lastday', today);
                } else {
                    if (isOutTurns) {
                        button.textContent = '✓ Xong';
                        if (questItem) questItem.classList.add('done');
                    } else {
                        button.textContent = quest.buttonText;
                        if (questItem) questItem.classList.remove('done');
                    }
                }
                break;
        }
    });
}

// ===============================================
// GẮN SỰ KIỆN CHO CÁC NÚT VÀ CONTROLS TRONG QUEST
// ===============================================
function attachQuestButtonHandlers() {
    // Gắn sự kiện cho tất cả các nút action
    document.querySelectorAll('.quest-action-btn').forEach(button => {
        const taskId = button.getAttribute('data-task');
        const questConfig = QUEST_CONFIG.find(q => q.taskId === taskId);
        
        if (!questConfig || !questConfig.action) return;
        
        button.addEventListener('click', async () => {
            const originalText = button.textContent;
            button.disabled = true;
            button.textContent = 'Đang xử lý...';
            
            try {
                await questConfig.action();
                await loadHH3DProfile(); // Refresh data sau khi hoàn thành
            } catch (error) {
                console.error(`[Quest ${taskId}] Error:`, error);
                showNotification(`Lỗi khi thực hiện ${questConfig.taskName}`, 'error');
            } finally {
                button.textContent = originalText;
                await updateAllQuestButtons();
                button.disabled = false;
            }
        });
    });
    
    // Gắn sự kiện cho các nút extra (như bonus)
    document.querySelectorAll('.quest-extra-btn').forEach(button => {
        const taskId = button.getAttribute('data-task');
        const questConfig = QUEST_CONFIG.find(q => q.taskId === taskId);
        
        if (!questConfig || !questConfig.extraAction) return;
        
        button.addEventListener('click', async () => {
            const originalText = button.textContent;
            button.disabled = true;
            button.textContent = '⏳';
            
            try {
                await questConfig.extraAction();
                showNotification(`${questConfig.taskName} - Extra hoàn thành`, 'success');
            } catch (error) {
                console.error(`[Quest ${taskId} Extra] Error:`, error);
                showNotification(`Lỗi khi thực hiện extra ${questConfig.taskName}`, 'error');
            } finally {
                button.textContent = originalText;
                button.disabled = false;
            }
        });
    });

    // Gắn sự kiện cho các nút extra2
    document.querySelectorAll('.quest-extra2-btn').forEach(button => {
        const taskId = button.getAttribute('data-task');
        const questConfig = QUEST_CONFIG.find(q => q.taskId === taskId);
        
        if (!questConfig || !questConfig.extra2Action) return;
        
        button.addEventListener('click', async () => {
            const originalText = button.textContent;
            button.disabled = true;
            button.textContent = '⏳';
            
            try {
                await questConfig.extra2Action();
                showNotification(`${questConfig.taskName} - ${questConfig.extra2ButtonTitle} hoàn thành`, 'success');
            } catch (error) {
                console.error(`[Quest ${taskId} Extra2] Error:`, error);
                showNotification(`Lỗi khi thực hiện ${questConfig.extra2ButtonTitle}`, 'error');
            } finally {
                button.textContent = originalText;
                button.disabled = false;
            }
        });
    });
    
    // Gắn sự kiện cho các select
    document.querySelectorAll('.quest-select').forEach(select => {
        const taskId = select.getAttribute('data-task');
        select.addEventListener('change', () => {
            localStorage.setItem(`${taskId}-choice`, select.value);
            console.log(`[Quest ${taskId}] Đã lưu lựa chọn: ${select.value}`);
        });
    });
    
    // Gắn sự kiện cho các input
    document.querySelectorAll('.quest-input').forEach(input => {
        const taskId = input.getAttribute('data-task');
        input.addEventListener('input', () => {
            let value = parseInt(input.value, 10);
            if (isNaN(value)) value = 0;
            if (value < input.min) value = input.min;
            if (value > input.max) value = input.max;
            input.value = value;
            const storageKey = `reserve${taskId.charAt(0).toUpperCase() + taskId.slice(1)}Attacks`;
            localStorage.setItem(storageKey, value.toString());
            console.log(`[Quest ${taskId}] Đã lưu giá trị reserve: ${value}`);
        });
    });
    
    // Gắn sự kiện cho các toggle button
    document.querySelectorAll('.quest-toggle').forEach(button => {
        const taskId = button.getAttribute('data-task');
        button.addEventListener('click', () => {
            const isEnabled = button.textContent === '🔔';
            const newState = !isEnabled;
            button.textContent = newState ? '🔔' : '🔕';
            localStorage.setItem(`${taskId}SocketEnabled`, newState ? '1' : '0');
            console.log(`[Quest ${taskId}] Socket tracking: ${newState ? 'Enabled' : 'Disabled'}`);
            
            // Xử lý logic đặc biệt cho Bí Cảnh
            if (taskId === 'bicanh') {
                if (newState) {
                    if (typeof bicanhhiente !== 'undefined' && bicanhhiente.startBossSocketListener) {
                        bicanhhiente.startBossSocketListener();
                    }
                } else {
                    if (typeof bicanhhiente !== 'undefined' && bicanhhiente.stopBossSocketListener) {
                        bicanhhiente.stopBossSocketListener();
                    }
                }
            }
        });
    });
    
    // Gắn sự kiện cho các settings button
    document.querySelectorAll('.quest-settings-btn').forEach(button => {
        const taskId = button.getAttribute('data-task');
        button.addEventListener('click', () => {
            showQuestSettings(taskId);
        });
    });

    // Gắn sự kiện toggle tối ưu hóa sát thương Hoang Vực
    const damageToggleBtn = document.querySelector('.hoangvuc-damage-toggle');
    if (damageToggleBtn) {
        damageToggleBtn.addEventListener('click', () => {
            const current = localStorage.getItem('hoangvucMaximizeDamage') === 'true';
            const next = !current;
            localStorage.setItem('hoangvucMaximizeDamage', String(next));
            damageToggleBtn.style.background = next ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.05)';
            damageToggleBtn.style.color = next ? '#22c55e' : '#9ca3af';
            damageToggleBtn.textContent = next ? '+15%' : '0%';
            showNotification(`Tối ưu hóa sát thương: ${next ? '+15%' : '0%'}`, 'info', 1500);
        });
    }

    // Gắn sự kiện Mua Đan Tông Môn
    const muadanTongBtn = document.querySelector('.muadan-tong-btn');
    const muadanTubaoBtn = document.querySelector('.muadan-tubao-btn');
    const muadanCountSel = document.querySelector('.muadan-count-select');

    if (muadanCountSel) {
        muadanCountSel.addEventListener('change', () => {
            localStorage.setItem('mua-dan-choice', muadanCountSel.value);
        });
    }

    if (muadanTongBtn) {
        muadanTongBtn.addEventListener('click', async () => {
            const n = parseInt(muadanCountSel?.value || localStorage.getItem('mua-dan-choice') || '3', 10);
            muadanTongBtn.disabled = true;
            muadanTongBtn.textContent = '⏳';
            try {
                await dantong.muaTopNDanTong(n);
                await loadHH3DProfile();
            } catch(e) {
                console.error('[Mua Đan Tông]', e);
                showNotification('Lỗi khi mua đan Tông Môn', 'error');
            } finally {
                muadanTongBtn.disabled = false;
                muadanTongBtn.textContent = '🍱 Tông';
            }
        });
    }

    if (muadanTubaoBtn) {
        muadanTubaoBtn.addEventListener('click', async () => {
            muadanTubaoBtn.disabled = true;
            muadanTubaoBtn.textContent = '⏳';
            try {
                await dantubao.autobuyTuBao();
                await loadHH3DProfile();
            } catch(e) {
                console.error('[Mua Đan Tụ Bảo]', e);
                showNotification('Lỗi khi mua đan Tụ Bảo Các', 'error');
            } finally {
                muadanTubaoBtn.disabled = false;
                muadanTubaoBtn.textContent = '🧄 Tụ Bảo';
            }
        });
    }

    // Gắn sự kiện Luận Võ inline controls
    const luanvoModeSel = document.querySelector('.luanvo-mode-select');
    const luanvoTargetInput = document.querySelector('.luanvo-target-input');

    if (luanvoModeSel) {
        luanvoModeSel.addEventListener('change', () => {
            const isManual = luanvoModeSel.value === 'manual';
            if (luanvoTargetInput) luanvoTargetInput.style.display = isManual ? 'inline-block' : 'none';
            localStorage.setItem('luanVoChallengeMode', luanvoModeSel.value);
        });
    }

    if (luanvoTargetInput) {
        luanvoTargetInput.addEventListener('input', () => {
            localStorage.setItem(`luanVoTargetUserId_${accountId}`, luanvoTargetInput.value);
        });
    }

    // === Tìm kiếm kẻ địch — 2 inline buttons, options in settings modal ===
    const kmSearchStartBtn = document.querySelector('.km-search-start-btn');
    const kmSearchViewBtn = document.querySelector('.km-search-view-btn');

    if (kmSearchStartBtn) {
        kmSearchStartBtn.addEventListener('click', async () => {
            kmSearchStartBtn.disabled = true;
            const originalText = kmSearchStartBtn.textContent;
            const updateBtn = (percent, msg) => {
                percent = Math.min(percent, 100);
                kmSearchStartBtn.textContent = `${percent}% - ${msg}`;
                kmSearchStartBtn.style.background = `linear-gradient(90deg, #2e7d32 ${percent}%, #333 ${percent}%)`;
                kmSearchStartBtn.style.color = '#fff';
            };
            updateBtn(0, 'Đang chuẩn bị...');
            const rawEnemyIds = localStorage.getItem(`khoangmach_search_enemies_${accountId}`) || '';
            const rawTongMonIds = localStorage.getItem(`khoangmach_search_tongmon_${accountId}`) || '';
            const enemyList = rawEnemyIds.split(';').map(s => s.trim()).filter(Boolean);
            const tongMonList = rawTongMonIds.split(';').map(s => s.trim()).filter(Boolean);
            try {
                await khoangmach.searchEnemiesInMines(enemyList, tongMonList, updateBtn);
                updateBtn(100, 'Xong!');
                await new Promise(r => setTimeout(r, 500));
            } catch (err) {
                console.error(err);
                showNotification('Lỗi tìm kiếm', 'error');
            } finally {
                kmSearchStartBtn.disabled = false;
                kmSearchStartBtn.textContent = originalText;
                kmSearchStartBtn.style.background = '';
                if (kmSearchViewBtn && sessionStorage.getItem('khoangmach_enemy_search_results')) {
                    kmSearchViewBtn.disabled = false;
                }
            }
        });
    }

    if (kmSearchViewBtn) {
        kmSearchViewBtn.addEventListener('click', () => {
            const saved = sessionStorage.getItem('khoangmach_enemy_search_results');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    if (Array.isArray(parsed)) {
                        khoangmach.showEnemySearchResults(parsed, Date.now(), 'Bộ nhớ tạm');
                    } else {
                        khoangmach.showEnemySearchResults(parsed.results, parsed.timestamp, parsed.source);
                    }
                } catch (e) {
                    console.error('Lỗi đọc dữ liệu đã lưu:', e);
                    showNotification('Dữ liệu lưu bị lỗi.', 'error');
                }
            } else {
                showNotification('Chưa có kết quả tìm kiếm nào.', 'info');
            }
        });
    }

    // Gắn sự kiện click vào icon để toggle autorun
    document.querySelectorAll('.nv-quest-icon[data-task]').forEach(icon => {
        const taskId = icon.getAttribute('data-task');
        const questConfig = QUEST_CONFIG.find(q => q.taskId === taskId);
        
        if (!questConfig || !questConfig.autorunEnabled) return;
        
        icon.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleQuestAutorun(taskId, questConfig.autorunKey);
        });
    });
}

// ===============================================
// TOGGLE AUTORUN CHO QUEST
// ===============================================
function toggleQuestAutorun(taskId, autorunKey) {
    const indicator = document.querySelector(`.quest-autorun-indicator[data-task="${taskId}"]`);
    if (!indicator) return;
    
    // Lấy trạng thái hiện tại
    const currentState = localStorage.getItem(autorunKey) !== '0';
    const newState = !currentState;
    
    // Lưu vào localStorage
    localStorage.setItem(autorunKey, newState ? '1' : '0');
    
    // Cập nhật UI
    if (newState) {
        indicator.classList.remove('disabled');
        indicator.classList.add('enabled');
    } else {
        indicator.classList.remove('enabled');
        indicator.classList.add('disabled');
    }
    
    // Hiển thị thông báo
    const questConfig = QUEST_CONFIG.find(q => q.taskId === taskId);
    const statusText = newState ? 'bật' : 'tắt';
    showNotification(`${questConfig.taskName}: Đã ${statusText} chạy tự động`, newState ? 'success' : 'info', 2000);
    
    console.log(`[Quest Autorun] ${taskId}: ${newState ? 'Enabled' : 'Disabled'}`);
}

// ===============================================
// HIỂN THỊ UNIFIED SETTINGS MODAL
// ===============================================
function showQuestSettings(taskId) {
    // Tạo modal nếu chưa tồn tại
    let modal = document.getElementById('unified-settings-modal');
    if (!modal) {
        modal = createUnifiedSettingsModal();
        document.body.appendChild(modal);
    }
    
    // Chuyển đến tab tương ứng (mặc định tab Chung)
    switchSettingsTab(taskId || 'general');
    
    // Hiển thị modal
    modal.style.display = 'flex';
}

// ===============================================
// HIỂN THỊ HƯỚNG DẪN SỬ DỤNG
// ===============================================
function showGuideModal() {
    let modal = document.getElementById('guide-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'guide-modal';
        modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:100000;';
        modal.innerHTML = `
            <div style="background:#1a1b2e;border-radius:12px;padding:20px 24px;max-width:520px;width:90%;max-height:80vh;overflow-y:auto;color:#c0caf5;font-size:13px;line-height:1.7;box-shadow:0 8px 32px rgba(0,0,0,0.5);border:1px solid #33467C;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
                    <h3 style="margin:0;color:#7aa2f7;font-size:16px;">📖 Hướng Dẫn Sử Dụng</h3>
                    <button id="guide-close-btn" style="background:none;border:none;color:#888;font-size:20px;cursor:pointer;padding:0 4px;">&times;</button>
                </div>
                <div style="border-top:1px solid #33467C;padding-top:12px;">
                    <p><strong style="color:#bb9af7;">Bắt Đầu / Dừng Lại:</strong> Chạy tự động tất cả nhiệm vụ.</p>
                    <p><strong style="color:#bb9af7;">🤖:</strong> Bật/tắt chế độ tự động chạy khi load trang.</p>
                    <p><strong style="color:#bb9af7;">🔄 Nút làm mới:</strong> Tải lại thông tin xu và tiến độ nhiệm vụ.</p>
                    <p><strong style="color:#bb9af7;">⚙️ Cài đặt:</strong> Cấu hình chi tiết cho từng nhiệm vụ.</p>
                    <p><strong style="color:#bb9af7;">💎 Hấp Thụ:</strong> Nhập mã CODE để nhận thưởng.</p>
                    <hr style="border-color:#33467C;margin:10px 0;">
                    <p><strong style="color:#9ece6a;">📋 Danh sách nhiệm vụ:</strong></p>
                    <ul style="padding-left:18px;margin:4px 0;">
                        <li>Nhấn nút hành động (Đánh, Nhận, Khắc,...) để chạy thủ công.</li>
                        <li>Các nút phụ (📦🙏🌺👑🎁) thực hiện hành động bổ sung.</li>
                        <li>Bấm vào icon trên mỗi task để bật/tắt tự động chạy mỗi task.</li>
                        <li>⏳ Thời gian đếm ngược hiển thị khi task đang chờ lượt tiếp.</li>
                    </ul>
                    <hr style="border-color:#33467C;margin:10px 0;">
                    <p><strong style="color:#f7768e;">⚠️ Lưu ý:</strong> Đảm bảo đã đăng nhập trước khi sử dụng.</p>
                </div>
            </div>
        `;
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.id === 'guide-close-btn') modal.style.display = 'none';
        });
        document.body.appendChild(modal);
    } else {
        modal.style.display = 'flex';
    }
}

// ===============================================
// TẠO UNIFIED SETTINGS MODAL
// ===============================================
function createUnifiedSettingsModal() {
    const modal = document.createElement('div');
    modal.id = 'unified-settings-modal';
    modal.className = 'settings-modal';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'settings-modal-content';
    
    // Header
    const header = document.createElement('div');
    header.className = 'settings-modal-header';
    header.innerHTML = `
        <h2>⚙️ Cài đặt nhiệm vụ</h2>
        <button class="settings-close-btn" onclick="document.getElementById('unified-settings-modal').style.display='none'">&times;</button>
    `;
    
    // Tabs container (horizontal scrolling)
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'settings-tabs-container';
    
    // Tab Chung (General) đầu tiên
    const generalTab = document.createElement('button');
    generalTab.className = 'settings-tab';
    generalTab.setAttribute('data-task', 'general');
    generalTab.innerHTML = '<i class="fas fa-sliders-h"></i> Chung';
    generalTab.onclick = () => switchSettingsTab('general');
    tabsContainer.appendChild(generalTab);
    
    // Lấy các quest có settings
    const questsWithSettings = QUEST_CONFIG.filter(q => q.hasSettings);
    
    questsWithSettings.forEach(quest => {
        const tab = document.createElement('button');
        tab.className = 'settings-tab';
        tab.setAttribute('data-task', quest.taskId);
        tab.innerHTML = `${quest.taskIcon} ${quest.taskName}`;
        tab.onclick = () => switchSettingsTab(quest.taskId);
        tabsContainer.appendChild(tab);
    });

    // Tab Log (luôn ở cuối)
    const logTab = document.createElement('button');
    logTab.className = 'settings-tab';
    logTab.setAttribute('data-task', 'log');
    logTab.innerHTML = '<i class="fas fa-list-alt"></i> Log';
    logTab.onclick = () => switchSettingsTab('log');
    tabsContainer.appendChild(logTab);
    
    // Content container
    const contentContainer = document.createElement('div');
    contentContainer.className = 'settings-content-container';
    contentContainer.id = 'settings-content';
    
    // Footer với nút Save
    const footer = document.createElement('div');
    footer.className = 'settings-modal-footer';
    const saveBtn = document.createElement('button');
    saveBtn.className = 'settings-save-btn';
    saveBtn.textContent = '💾 Lưu cài đặt';
    saveBtn.addEventListener('click', saveAllSettings);
    footer.appendChild(saveBtn);
    
    modalContent.appendChild(header);
    modalContent.appendChild(tabsContainer);
    modalContent.appendChild(contentContainer);
    modalContent.appendChild(footer);
    modal.appendChild(modalContent);
    
    // Click outside to close
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    };
    
    return modal;
}

// ===============================================
// CHUYỂN TAB SETTINGS
// ===============================================
function switchSettingsTab(taskId) {
    // Update active tab
    document.querySelectorAll('.settings-tab').forEach(tab => {
        if (tab.getAttribute('data-task') === taskId) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    // Load content for this task
    const contentContainer = document.getElementById('settings-content');
    if (contentContainer) {
        contentContainer.innerHTML = getSettingsContentForTask(taskId);
        
        // Bind events after content loaded
        setTimeout(() => bindSettingsEventsForTask(taskId), 50);
    }
}

// ===============================================
// LẤY NỘI DUNG CÀI ĐẶT CHO TASK
// ===============================================
function getSettingsContentForTask(taskId) {
    const accountId = localStorage.getItem('hh3d_account_id') || '';
    switch(taskId) {
        case 'general':
            return `
                <div class="settings-section">
                    <h3>Chung</h3>

                    <div class="settings-option">
                        <label>Giờ tự khởi động lại hàng ngày:</label>
                        <div style="display:flex;gap:8px;align-items:center;margin-top:6px">
                            <input type="number" id="general-restart-hour" min="0" max="23" value="${parseInt(localStorage.getItem('selfSchedule_h') ?? '0', 10) || 0}"
                                style="width:55px;padding:4px 6px;border-radius:4px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.07);color:#d0d8f0;text-align:center">
                            <span>giờ</span>
                            <input type="number" id="general-restart-minute" min="0" max="59" value="${parseInt(localStorage.getItem('selfSchedule_m') ?? '30', 10)}"
                                style="width:55px;padding:4px 6px;border-radius:4px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.07);color:#d0d8f0;text-align:center">
                            <span>phút</span>
                        </div>
                        <p class="settings-description">Tự động dừng và chạy lại script vào giờ đã đặt (mặc định 00:30)<br>Bấm lưu lại để áp dụng thay đổi</p>
                    </div>

                    <div class="settings-option">
                        <label>Nhiệm vụ:</label>
                        <button id="general-reset-tasks-btn" class="settings-save-btn" style="background:rgba(239,68,68,0.2);color:#ef4444;border:1px solid rgba(239,68,68,0.3);margin-top:6px;width:100%">
                            🔄 Reset trạng thái hoàn thành
                        </button>
                    </div>

                    <div class="settings-option" style="margin-top:10px">
                        <label>Truy cập nhanh:</label>
                        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;margin-top:6px">
                            <span style="font-size:11px;color:#9ca3af">Mở:</span>
                            <label style="display:flex;align-items:center;gap:4px;font-size:11px;color:#e0e0e0;cursor:pointer">
                                <input type="radio" name="link-open-mode" id="link-mode-new" value="new" style="cursor:pointer"> Tab mới
                            </label>
                            <label style="display:flex;align-items:center;gap:4px;font-size:11px;color:#e0e0e0;cursor:pointer">
                                <input type="radio" name="link-open-mode" id="link-mode-current" value="current" style="cursor:pointer"> Tab hiện tại
                            </label>
                        </div>
                        <div style="display:flex;flex-wrap:wrap;gap:5px">
                            <button class="general-link-btn" data-path="/cai-dat-tai-khoan">⚙️ Tài khoản</button>
                            <button class="general-link-btn" data-path="/bang-xep-hang-truyen-thua">🏆 BXH Truyền Thừa</button>
                            <button class="general-link-btn" data-path="/bang-xep-hang">📊 BXH Tu Vi</button>
                            <button class="general-link-btn" data-path="/bang-phu-hao-tinh-thach">💎 BXH Phú Hào</button>
                            <button class="general-link-btn" data-path="/bang-xep-hang-tong-mon">⚔️ BXH Tông Môn</button>
                            <button class="general-link-btn" data-path="/bxh-tien-duyen">💞 BXH Tiên Duyên</button>
                            <button class="general-link-btn" data-path="/tu-bao-cac">🧄 Tụ Bảo Các</button>
                            <button class="general-link-btn" data-path="/vip-hh3d">💰 Xu HH3D</button>
                            <button class="general-link-btn" data-path="/mini-games-hh3d">🎮 Mini Game</button>
                            <button class="general-link-btn" data-path="/thien-dao-ban-thuong">🎁 Thiên Đạo</button>
                            <button class="general-link-btn" data-path="/cap-nhat-he-thong-tu-luyen">🔧 Đổi Hệ Thống</button>
                            <button class="general-link-btn" data-path="/danh-sach-thanh-vien-tong-mon">👥 Thành Viên TM</button>
                            <button class="general-link-btn" data-path="/do-kiep-dai">⚡ Độ Kiếp Đài</button>
                            <button class="general-link-btn" data-path="/thong-bao-tu-chu-phu">📢 Thông Báo</button>
                        </div>
                    </div>
                </div>
            `;

        case 'hoangvuc':
            return `
                <div class="settings-section">
                    <h3>Cài đặt Hoang Vực</h3>
                    <div class="settings-option">
                        <label class="settings-checkbox-label">
                            <input type="checkbox" id="hoangvuc-maximize-damage" 
                                   ${localStorage.getItem('hoangvucMaximizeDamage') === 'true' ? 'checked' : ''}>
                            <span>Tối đa hóa sát thương (buff ngũ hành)</span>
                        </label>
                        <p class="settings-description">Tự động chọn ngũ hành để tăng 15% sát thương</p>
                    </div>
                </div>
            `;
            
        case 'khoangmach': {
            const _savedRewardMode = localStorage.getItem('khoangmach_reward_mode') || 'any';
            const _savedRewardTime = localStorage.getItem('khoangmach_reward_time') || 'max';
            return `
                <div class="settings-section">
                    <h3>Cài đặt Khoáng Mạch</h3>

                    <div class="settings-option" style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
                        <label for="khoangmach-mine-select" style="white-space:nowrap">Chọn Khoáng Mạch:</label>
                        <select id="khoangmach-mine-select" class="settings-select" style="flex:1;min-width:120px">
                            <option value="">⏳ Đang tải danh sách mỏ...</option>
                        </select>
                        <button id="khoangmach-reload-mines-btn" title="Tải lại danh sách mỏ" style="padding:3px 8px;font-size:11px;border-radius:4px;border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.07);color:#d0d8f0;cursor:pointer;white-space:nowrap">🔄 Load</button>
                    </div>

                    <div class="settings-option">
                        <label for="khoangmach-reward-mode">Chế độ Nhận Thưởng:</label>
                        <select id="khoangmach-reward-mode" class="settings-select">
                            <option value="110" ${_savedRewardMode === '110' ? 'selected' : ''}>110%</option>
                            <option value="100" ${_savedRewardMode === '100' ? 'selected' : ''}>100%</option>
                            <option value="20" ${_savedRewardMode === '20' ? 'selected' : ''}>20%</option>
                            <option value="any" ${_savedRewardMode === 'any' ? 'selected' : ''}>Bất kỳ</option>
                        </select>
                    </div>

                    <div class="settings-option">
                        <label for="khoangmach-reward-time">Nhận thưởng khi thời gian đạt:</label>
                        <select id="khoangmach-reward-time" class="settings-select">
                            <option value="max" ${_savedRewardTime === 'max' ? 'selected' : ''}>Đạt tối đa</option>
                            <option value="20" ${_savedRewardTime === '20' ? 'selected' : ''}>20 phút</option>
                            <option value="10" ${_savedRewardTime === '10' ? 'selected' : ''}>10 phút</option>
                            <option value="4" ${_savedRewardTime === '4' ? 'selected' : ''}>4 phút</option>
                            <option value="2" ${_savedRewardTime === '2' ? 'selected' : ''}>2 phút</option>
                        </select>
                    </div>

                    <div class="settings-option">
                        <label class="settings-checkbox-label">
                            <input type="checkbox" id="khoangmach-auto-takeover"
                                   ${localStorage.getItem('khoangmach_auto_takeover') === 'true' ? 'checked' : ''}>
                            <span>Tự động đoạt mỏ khi chưa buff</span>
                        </label>
                    </div>

                    <div class="settings-option">
                        <label class="settings-checkbox-label">
                            <input type="checkbox" id="khoangmach-auto-takeover-rotation"
                                   ${localStorage.getItem('khoangmach_auto_takeover_rotation') === 'true' ? 'checked' : ''}>
                            <span>Tự động đoạt mỏ khi có thể (đảo key)</span>
                        </label>
                    </div>

                    <div class="settings-option">
                        <label class="settings-checkbox-label">
                            <input type="checkbox" id="khoangmach-leave-mine"
                                   ${localStorage.getItem('khoangmach_leave_mine_to_claim_reward_' + accountId) === 'true' ? 'checked' : ''}>
                            <span>Rời mỏ để nhận thưởng (cao tầng đảo key)</span>
                        </label>
                    </div>

                    <div class="settings-option">
                        <label class="settings-checkbox-label">
                            <input type="checkbox" id="khoangmach-use-buff"
                                   ${localStorage.getItem('khoangmach_use_buff') === 'true' ? 'checked' : ''}>
                            <span>Tự động mua Linh Quang Phù</span>
                        </label>
                    </div>

                    <div class="settings-option">
                        <label class="settings-checkbox-label">
                            <input type="checkbox" id="khoangmach-outer-notification"
                                   ${localStorage.getItem('khoangmach_outer_notification') === 'true' ? 'checked' : ''}>
                            <span>Thông báo ngoại tông vào khoáng</span>
                        </label>
                    </div>

                    <div class="settings-option">
                        <label class="settings-checkbox-label">
                            <input type="checkbox" id="khoangmach-fast-attack"
                                   ${localStorage.getItem('khoangmach_fast_attack') === 'true' ? 'checked' : ''}>
                            <span>Bỏ qua thời gian chờ khi tấn công</span>
                        </label>
                    </div>

                    <div class="settings-option">
                        <label for="khoangmach-check-interval" title="Khoảng thời gian (phút) để kiểm tra và thực hiện các hành động liên quan đến Khoáng Mạch.">Thời gian kiểm tra khoáng (phút):</label>
                        <input type="number" id="khoangmach-check-interval" class="settings-input-number"
                               value="${localStorage.getItem('khoangmach_check_interval') || '5'}" min="1" max="60" style="width:60px">
                    </div>
                </div>
            `;
        }

        case 'kmsearch': {
            const _savedEnemyIds = localStorage.getItem(`khoangmach_search_enemies_${accountId}`) || '';
            const _savedTongMonIds = localStorage.getItem(`khoangmach_search_tongmon_${accountId}`) || '';
            const _savedMineIds = (() => { try { const r = localStorage.getItem('khoangmach_search_mine_ids'); return r ? JSON.parse(r) : null; } catch(e) { return null; } })();
            const _isAllMines = !_savedMineIds || _savedMineIds.length === 0;
            return `
                <div class="settings-section">
                    <h3>Tìm Kẻ Địch (Khoáng Mạch)</h3>

                    <div class="settings-option">
                        <label>ID kẻ địch:</label>
                        <div style="display:flex;gap:6px;align-items:center;margin-top:6px">
                            <input type="text" id="kmsearch-enemy-add-input" class="settings-input" style="flex:1" placeholder="Nhập ID kẻ địch..." />
                            <button id="kmsearch-enemy-add-btn" style="padding:4px 12px;font-size:12px;border-radius:4px;border:1px solid rgba(255,255,255,0.2);background:rgba(99,179,237,0.15);color:#63b3ed;cursor:pointer;white-space:nowrap">➕ Thêm</button>
                        </div>
                        <div id="kmsearch-enemy-list" style="display:flex;flex-wrap:wrap;gap:5px;margin-top:8px"></div>
                    </div>

                    <div class="settings-option">
                        <label for="kmsearch-tongmon-input">ID Tông Môn (cách nhau bằng dấu <b>;</b>):</label>
                        <div style="display:flex;gap:6px;align-items:center">
                            <input type="text" id="kmsearch-tongmon-input" class="settings-input" style="flex:1" placeholder="57264;57265" value="${_savedTongMonIds}" />
                            <button id="kmsearch-tongmon-view-btn" style="padding:3px 8px;font-size:11px;border-radius:4px;border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.07);color:#d0d8f0;cursor:pointer;white-space:nowrap">👁 Danh sách TM</button>
                        </div>
                        <div id="kmsearch-tongmon-container" style="display:none;max-height:240px;overflow-y:auto;margin-top:6px;padding:4px;background:rgba(255,255,255,0.03);border-radius:4px"></div>
                    </div>

                    <div class="settings-option">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                            <label style="margin:0">Mỏ cần quét:</label>
                            <button id="kmsearch-mine-load-btn" style="padding:3px 8px;font-size:11px;border-radius:4px;border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.07);color:#d0d8f0;cursor:pointer;white-space:nowrap">🔄 Tải DS mỏ</button>
                        </div>
                        <div style="display:flex;align-items:center;gap:6px;padding:3px 0;border-bottom:1px solid rgba(255,255,255,0.07);margin-bottom:4px">
                            <label style="display:flex;align-items:center;gap:4px;font-size:11px;cursor:pointer;flex-shrink:0">
                                <input type="checkbox" id="kmsearch-mine-all" ${_isAllMines ? 'checked' : ''}> Tất cả
                            </label>
                            <button id="kmsearch-mine-sel-gold" style="padding:2px 7px;font-size:10px;border-radius:4px;border:1px solid rgba(245,197,66,0.4);background:rgba(245,197,66,0.1);color:#f5c542;cursor:pointer;white-space:nowrap">Thượng</button>
                            <button id="kmsearch-mine-sel-silver" style="padding:2px 7px;font-size:10px;border-radius:4px;border:1px solid rgba(192,192,192,0.4);background:rgba(192,192,192,0.1);color:#c0c0c0;cursor:pointer;white-space:nowrap">Trung</button>
                        </div>
                        <div id="kmsearch-mine-container" style="max-height:200px;overflow-y:auto;padding:2px;font-size:11px;color:#9ca3af">
                            Bấm "Tải DS mỏ" để xem danh sách
                        </div>
                    </div>
                </div>
            `;
        }

        default:
            return `<div class="settings-section"><p>Không có cài đặt cho nhiệm vụ này</p></div>`;

        case 'log':
            return `
                <div class="settings-section" style="padding:8px">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                        <h3 style="margin:0">📋 Lịch Sử Log</h3>
                        <div style="display:flex;gap:6px">
                            <select id="hh3d-log-filter" style="font-size:11px;padding:2px 6px;border-radius:4px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.07);color:#d0d8f0">
                                <option value="all">Tất cả</option>
                                <option value="success">✅ Success</option>
                                <option value="warn">⚠️ Warn</option>
                                <option value="error">❌ Error</option>
                                <option value="info">ℹ️ Info</option>
                                <option value="debug">🔍 Debug</option>
                            </select>
                            <button id="hh3d-log-clear" style="font-size:11px;padding:2px 8px;border-radius:4px;border:1px solid rgba(239,68,68,0.4);background:rgba(239,68,68,0.1);color:#f87171;cursor:pointer">🗑 Xóa</button>
                        </div>
                    </div>
                    <div id="hh3d-log-list" style="height:380px;overflow-y:auto;background:rgba(0,0,0,0.3);border-radius:4px;border:1px solid rgba(255,255,255,0.08)"></div>
                </div>
            `;
    }
}

// ===============================================
// BIND EVENTS CHO SETTINGS
// ===============================================
function bindSettingsEventsForTask(taskId) {
    switch(taskId) {
        case 'general': {
            const resetBtn = document.getElementById('general-reset-tasks-btn');
            if (resetBtn) {
                resetBtn.addEventListener('click', () => {
                    const accId = localStorage.getItem('hh3d_account_id') || accountId;
                    const count = taskTracker.resetAllTasks(accId);
                    showNotification(`✅ Đã reset ${count} nhiệm vụ`, 'success', 2000);
                    updateAllQuestButtons();
                });
            }
            // Restore saved open-mode preference
            const _linkModeKey = 'general_link_open_mode';
            const _savedMode = localStorage.getItem(_linkModeKey) || 'new';
            const _modeNewRadio = document.getElementById('link-mode-new');
            const _modeCurrentRadio = document.getElementById('link-mode-current');
            if (_modeNewRadio) _modeNewRadio.checked = _savedMode === 'new';
            if (_modeCurrentRadio) _modeCurrentRadio.checked = _savedMode === 'current';
            document.querySelectorAll('input[name="link-open-mode"]').forEach(radio => {
                radio.addEventListener('change', () => localStorage.setItem(_linkModeKey, radio.value));
            });

            document.querySelectorAll('.general-link-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const path = btn.getAttribute('data-path');
                    if (!path) return;
                    const url = weburl.replace(/\/$/, '') + path;
                    const mode = localStorage.getItem(_linkModeKey) || 'new';
                    if (mode === 'current') window.location.href = url;
                    else window.open(url, '_blank');
                });
            });
            break;
        }

        case 'hoangvuc':
            // No special events needed, just checkbox
            break;
            
        case 'khoangmach': {
            // Async load danh sách mỏ
            const km_sel = document.getElementById('khoangmach-mine-select');
            const km_reloadBtn = document.getElementById('khoangmach-reload-mines-btn');
            const km_accountId = localStorage.getItem('hh3d_account_id') || '';

            const km_populateMines = (force = false) => {
                if (km_sel) km_sel.innerHTML = '<option value="">⏳ Đang tải...</option>';
                if (km_reloadBtn) { km_reloadBtn.disabled = true; km_reloadBtn.textContent = '⏳'; }
                khoangmach.getAllMines(force).then(({ optionsHtml, minesData }) => {
                    const savedMineSetting = localStorage.getItem(`khoangmach_selected_mine_${km_accountId}`);
                    let savedMineId = '';
                    try { savedMineId = savedMineSetting ? JSON.parse(savedMineSetting).id : ''; } catch(e) {}
                    km_sel.innerHTML = `<option value="">-- Chọn mỏ --</option>` + optionsHtml;
                    if (savedMineId) {
                        const opt = km_sel.querySelector(`option[value="${savedMineId}"]`);
                        if (opt) opt.selected = true;
                    }
                    minesData.forEach(mine => {
                        const opt = km_sel.querySelector(`option[value="${mine.id}"]`);
                        if (opt) opt.dataset.mine = JSON.stringify({ id: mine.id, type: mine.type });
                    });
                    if (force) showNotification(`✅ Đã tải ${minesData.length} mỏ`, 'success', 1500);
                }).catch(() => {
                    km_sel.innerHTML = '<option value="">⚠️ Không tải được danh sách mỏ</option>';
                }).finally(() => {
                    if (km_reloadBtn) { km_reloadBtn.disabled = false; km_reloadBtn.textContent = '🔄 Load'; }
                });
            };

            km_populateMines(false);

            if (km_reloadBtn) {
                km_reloadBtn.addEventListener('click', () => km_populateMines(true));
            }
            break;
        }
            
        case 'kmsearch': {
            const ks_accountId = localStorage.getItem('hh3d_account_id') || '';
            const ks_enemyAddInput = document.getElementById('kmsearch-enemy-add-input');
            const ks_enemyAddBtn = document.getElementById('kmsearch-enemy-add-btn');
            const ks_enemyList = document.getElementById('kmsearch-enemy-list');
            const ks_enemyKey = `khoangmach_search_enemies_${ks_accountId}`;

            const ks_getEnemyIds = () => (localStorage.getItem(ks_enemyKey) || '').split(';').map(s => s.trim()).filter(Boolean);
            const ks_saveEnemyIds = (ids) => localStorage.setItem(ks_enemyKey, ids.join(';'));
            const ks_renderEnemyTags = () => {
                if (!ks_enemyList) return;
                const ids = ks_getEnemyIds();
                ks_enemyList.innerHTML = '';
                if (ids.length === 0) {
                    ks_enemyList.innerHTML = '<span style="color:#6b7280;font-size:11px">Chưa có ID nào</span>';
                    return;
                }
                ids.forEach(id => {
                    const tag = document.createElement('div');
                    tag.style.cssText = 'display:inline-flex;align-items:center;gap:4px;padding:3px 8px;background:rgba(99,179,237,0.12);border:1px solid rgba(99,179,237,0.3);border-radius:12px;font-size:12px;color:#63b3ed';
                    tag.innerHTML = `<span>${id}</span><button style="background:none;border:none;color:#fc8181;cursor:pointer;font-size:13px;line-height:1;padding:0" data-id="${id}">&times;</button>`;
                    tag.querySelector('button').addEventListener('click', () => {
                        const cur = ks_getEnemyIds().filter(x => x !== id);
                        ks_saveEnemyIds(cur);
                        ks_renderEnemyTags();
                    });
                    ks_enemyList.appendChild(tag);
                });
            };

            if (ks_enemyAddBtn && ks_enemyAddInput) {
                const ks_doAdd = () => {
                    const val = ks_enemyAddInput.value.trim();
                    if (!val) return;
                    const cur = ks_getEnemyIds();
                    if (!cur.includes(val)) { cur.push(val); ks_saveEnemyIds(cur); }
                    ks_enemyAddInput.value = '';
                    ks_renderEnemyTags();
                };
                ks_enemyAddBtn.addEventListener('click', ks_doAdd);
                ks_enemyAddInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); ks_doAdd(); } });
            }
            ks_renderEnemyTags();

            const ks_tongMonInput = document.getElementById('kmsearch-tongmon-input');
            const ks_tongMonViewBtn = document.getElementById('kmsearch-tongmon-view-btn');
            const ks_tongMonContainer = document.getElementById('kmsearch-tongmon-container');
            const ks_mineContainer = document.getElementById('kmsearch-mine-container');
            const ks_mineLoadBtn = document.getElementById('kmsearch-mine-load-btn');
            const ks_mineAllChk = document.getElementById('kmsearch-mine-all');

            if (ks_tongMonInput && ks_tongMonContainer && ks_tongMonViewBtn) {
                const ks_selKey = `khoangmach_search_tongmon_${ks_accountId}`;
                const ks_parseIds = (raw) => {
                    const list = (raw || '').split(';').map(s => s.trim()).filter(Boolean);
                    const set = new Set();
                    const unique = [];
                    for (const id of list) if (!set.has(id)) { set.add(id); unique.push(id); }
                    return { list: unique, set };
                };
                const ks_normalize = (ids) => (ids || []).join(';');
                let ks_cbMap = new Map();
                let ks_syncing = false;
                let ks_loaded = false;

                const ks_syncInput = (v) => {
                    if (ks_tongMonInput.value === v) return;
                    ks_syncing = true;
                    try { ks_tongMonInput.value = v; localStorage.setItem(ks_selKey, v); }
                    finally { ks_syncing = false; }
                };
                const ks_syncCheckboxes = () => {
                    if (!ks_cbMap.size) return;
                    const { set } = ks_parseIds(ks_tongMonInput.value);
                    for (const [id, cb] of ks_cbMap.entries()) cb.checked = set.has(id);
                };
                const ks_renderList = (list) => {
                    ks_tongMonContainer.innerHTML = '';
                    ks_cbMap = new Map();
                    list.sort((a, b) => b.level - a.level);
                    const current = ks_parseIds(ks_tongMonInput.value);
                    for (const tm of (list || [])) {
                        const row = document.createElement('div');
                        row.style.cssText = 'display:flex;align-items:center;gap:6px;padding:2px 0';
                        const cb = document.createElement('input');
                        cb.type = 'checkbox';
                        cb.checked = current.set.has(tm.id);
                        ks_cbMap.set(tm.id, cb);
                        const lbl = document.createElement('span');
                        lbl.style.color = `hsl(${(Math.min(tm.level, 10) - 1) * 36}, 100%, 50%)`;
                        lbl.style.fontSize = '11px';
                        lbl.textContent = `[Cấp ${tm.level}] ${tm.name}`;
                        cb.addEventListener('change', () => {
                            const { list: ids } = ks_parseIds(ks_tongMonInput.value);
                            const s = new Set(ids);
                            if (cb.checked) { if (!s.has(tm.id)) ids.push(tm.id); }
                            else { const i = ids.indexOf(tm.id); if (i !== -1) ids.splice(i, 1); }
                            ks_syncInput(ks_normalize(ids));
                        });
                        row.appendChild(cb); row.appendChild(lbl);
                        ks_tongMonContainer.appendChild(row);
                    }
                    ks_syncCheckboxes();
                };

                ks_tongMonInput.addEventListener('input', () => {
                    localStorage.setItem(ks_selKey, ks_tongMonInput.value);
                    if (!ks_syncing) ks_syncCheckboxes();
                });
                ks_tongMonViewBtn.addEventListener('click', async () => {
                    if (ks_loaded && ks_tongMonContainer.innerHTML && ks_tongMonContainer.style.display !== 'none') {
                        ks_tongMonContainer.style.display = 'none';
                        return;
                    }
                    ks_tongMonContainer.style.display = 'block';
                    ks_tongMonContainer.innerHTML = 'Đang tải...';
                    try {
                        const data = await khoangmach.getListTongMon();
                        ks_renderList(data);
                        ks_loaded = true;
                    } catch (e) {
                        ks_tongMonContainer.innerHTML = '';
                        showNotification(`Không tải được danh sách tông môn: ${e}`, 'error');
                    }
                });
            }

            // --- Mine selection ---
            if (ks_mineContainer) {
                const ks_mineKey = 'khoangmach_search_mine_ids';
                const ks_getSavedMineIds = () => {
                    try {
                        const raw = localStorage.getItem(ks_mineKey);
                        if (!raw) return null;
                        const arr = JSON.parse(raw);
                        return Array.isArray(arr) && arr.length > 0 ? arr.map(String) : null;
                    } catch(e) { return null; }
                };
                const ks_saveMineIds = (ids) => {
                    if (!ids || ids.length === 0) localStorage.removeItem(ks_mineKey);
                    else localStorage.setItem(ks_mineKey, JSON.stringify(ids));
                };

                let ks_mineCbMap = new Map();

                const ks_renderMines = (minesData) => {
                    ks_mineCbMap = new Map();
                    ks_mineContainer.innerHTML = '';
                    const savedIds = ks_getSavedMineIds();
                    const isAll = !savedIds;
                    if (ks_mineAllChk) ks_mineAllChk.checked = isAll;

                    const allowedTypes = new Set(['gold', 'silver']);
                    const mines = (minesData || []).filter(m => allowedTypes.has(String(m.type)));

                    const typeLabel = (t) => t === 'gold' ? 'Thượng' : t === 'silver' ? 'Trung' : 'Hạ';
                    const typeColor = (t) => t === 'gold' ? '#f5c542' : t === 'silver' ? '#c0c0c0' : '#cd7f32';

                    const ks_onMineChange = () => {
                        const selected = [];
                        for (const [id, c] of ks_mineCbMap.entries()) if (c.checked) selected.push(id);
                        const allChecked = selected.length === ks_mineCbMap.size;
                        ks_saveMineIds(allChecked ? null : selected);
                        if (ks_mineAllChk) ks_mineAllChk.checked = allChecked;
                    };

                    for (const mine of mines) {
                        const row = document.createElement('div');
                        row.style.cssText = 'display:flex;align-items:center;gap:6px;padding:2px 4px;cursor:pointer;border-radius:3px';
                        row.addEventListener('mouseenter', () => { row.style.background = 'rgba(255,255,255,0.06)'; });
                        row.addEventListener('mouseleave', () => { row.style.background = ''; });
                        const cb = document.createElement('input');
                        cb.type = 'checkbox';
                        cb.style.cssText = 'pointer-events:none;flex-shrink:0';
                        cb.checked = isAll || (savedIds.includes(String(mine.id)));
                        cb._mineType = String(mine.type);
                        ks_mineCbMap.set(String(mine.id), cb);
                        const lbl = document.createElement('span');
                        lbl.style.color = typeColor(mine.type);
                        lbl.style.fontSize = '11px';
                        lbl.textContent = `[${typeLabel(mine.type)}] ${mine.name} (${mine.id})`;
                        row.addEventListener('click', () => {
                            cb.checked = !cb.checked;
                            ks_onMineChange();
                        });
                        row.appendChild(cb); row.appendChild(lbl);
                        ks_mineContainer.appendChild(row);
                    }

                    if (mines.length === 0) ks_mineContainer.textContent = 'Không có mỏ Thượng/Trung trong cache.';
                };

                const ks_loadMines = async (force = false) => {
                    if (ks_mineLoadBtn) { ks_mineLoadBtn.disabled = true; ks_mineLoadBtn.textContent = '⏳'; }
                    ks_mineContainer.innerHTML = 'Đang tải...';
                    try {
                        const { minesData } = await khoangmach.getAllMines(force);
                        ks_renderMines(minesData);
                        if (force) showNotification(`✅ Đã tải danh sách mỏ`, 'success', 1500);
                    } catch(e) {
                        ks_mineContainer.textContent = '⚠️ Không tải được danh sách mỏ';
                    } finally {
                        if (ks_mineLoadBtn) { ks_mineLoadBtn.disabled = false; ks_mineLoadBtn.textContent = '🔄 Tải DS mỏ'; }
                    }
                };

                if (ks_mineAllChk) {
                    ks_mineAllChk.addEventListener('change', () => {
                        const checked = ks_mineAllChk.checked;
                        for (const [, cb] of ks_mineCbMap.entries()) cb.checked = checked;
                        ks_saveMineIds(checked ? null : []);
                    });
                }

                const ks_mineSelGoldBtn = document.getElementById('kmsearch-mine-sel-gold');
                const ks_mineSelSilverBtn = document.getElementById('kmsearch-mine-sel-silver');

                if (ks_mineSelGoldBtn) {
                    ks_mineSelGoldBtn.addEventListener('click', () => {
                        const selected = [];
                        for (const [id, cb] of ks_mineCbMap.entries()) {
                            const isGold = cb._mineType === 'gold';
                            cb.checked = isGold;
                            if (isGold) selected.push(id);
                        }
                        if (ks_mineAllChk) ks_mineAllChk.checked = false;
                        ks_saveMineIds(selected);
                    });
                }

                if (ks_mineSelSilverBtn) {
                    ks_mineSelSilverBtn.addEventListener('click', () => {
                        const selected = [];
                        for (const [id, cb] of ks_mineCbMap.entries()) {
                            const isSilver = cb._mineType === 'silver';
                            cb.checked = isSilver;
                            if (isSilver) selected.push(id);
                        }
                        if (ks_mineAllChk) ks_mineAllChk.checked = false;
                        ks_saveMineIds(selected);
                    });
                }

                if (ks_mineLoadBtn) {
                    ks_mineLoadBtn.addEventListener('click', () => ks_loadMines(false));
                }

                // Auto-load from cache on settings open
                ks_loadMines(false);
            }

            break;
        }

        case 'bicanh':
        case 'general':
            // No special events
            break;

        case 'log': {
            const logList = document.getElementById('hh3d-log-list');
            const logFilter = document.getElementById('hh3d-log-filter');
            const logClear = document.getElementById('hh3d-log-clear');

            const renderLogs = (filter = 'all') => {
                if (!logList) return;
                logList.innerHTML = '';
                const entries = (window.hh3dLogBuffer || []).filter(e => filter === 'all' || e.type === filter);
                // Newest first
                for (let i = entries.length - 1; i >= 0; i--) {
                    _hh3dRenderLogLine(logList, entries[i], false);
                }
            };

            renderLogs('all');

            if (logFilter) logFilter.addEventListener('change', () => renderLogs(logFilter.value));
            if (logClear) logClear.addEventListener('click', () => {
                window.hh3dLogBuffer = [];
                renderLogs('all');
            });
            break;
        }

        default:
            break;
    }
}

// ===============================================
// LƯU TẤT CẢ CÀI ĐẶT
// ===============================================
function saveAllSettings() {
    // Xác định tab hiện tại
    const activeTab = document.querySelector('.settings-tab.active');
    if (!activeTab) return;
    
    const taskId = activeTab.getAttribute('data-task');
    const accountId = localStorage.getItem('hh3d_account_id') || '';
    let saved = false;
    
    try {
        switch(taskId) {
            case 'general': {
                const h = parseInt(document.getElementById('general-restart-hour')?.value ?? '0', 10) || 0;
                const m = parseInt(document.getElementById('general-restart-minute')?.value ?? '30', 10);
                localStorage.setItem('selfSchedule_h', String(h));
                localStorage.setItem('selfSchedule_m', String(m));
                saved = true;
                break;
            }

            case 'hoangvuc':
                const maximizeDamage = document.getElementById('hoangvuc-maximize-damage')?.checked || false;
                localStorage.setItem('hoangvucMaximizeDamage', maximizeDamage.toString());
                saved = true;
                break;
                
            case 'khoangmach': {
                const km_useBuff = document.getElementById('khoangmach-use-buff')?.checked || false;
                const km_fastAttack = document.getElementById('khoangmach-fast-attack')?.checked || false;
                const km_autoTakeover = document.getElementById('khoangmach-auto-takeover')?.checked || false;
                const km_autoTakeoverRotation = document.getElementById('khoangmach-auto-takeover-rotation')?.checked || false;
                const km_outerNotification = document.getElementById('khoangmach-outer-notification')?.checked || false;
                const km_leaveMine = document.getElementById('khoangmach-leave-mine')?.checked || false;
                const km_rewardMode = document.getElementById('khoangmach-reward-mode')?.value || 'any';
                const km_rewardTime = document.getElementById('khoangmach-reward-time')?.value || 'max';
                const km_checkInterval = parseInt(document.getElementById('khoangmach-check-interval')?.value || '5', 10);

                // Lưu mỏ đã chọn (data-mine chứa JSON {id, type})
                const km_mineSelect = document.getElementById('khoangmach-mine-select');
                if (km_mineSelect && km_mineSelect.value) {
                    const mineData = km_mineSelect.options[km_mineSelect.selectedIndex]?.dataset?.mine;
                    if (mineData) localStorage.setItem(`khoangmach_selected_mine_${accountId}`, mineData);
                }

                localStorage.setItem('khoangmach_use_buff', String(km_useBuff));
                localStorage.setItem('khoangmach_fast_attack', String(km_fastAttack));
                localStorage.setItem('khoangmach_auto_takeover', String(km_autoTakeover));
                localStorage.setItem('khoangmach_auto_takeover_rotation', String(km_autoTakeoverRotation));
                localStorage.setItem('khoangmach_outer_notification', String(km_outerNotification));
                localStorage.setItem(`khoangmach_leave_mine_to_claim_reward_${accountId}`, String(km_leaveMine));
                localStorage.setItem('khoangmach_reward_mode', km_rewardMode);
                localStorage.setItem('khoangmach_reward_time', km_rewardTime);
                localStorage.setItem('khoangmach_check_interval', isNaN(km_checkInterval) || km_checkInterval < 1 ? '5' : String(km_checkInterval));
                saved = true;
                break;
            }
                
            case 'kmsearch':
                // inputs save on keystroke via bindSettingsEventsForTask; nothing extra to save
                saved = true;
                break;

            case 'bicanh':
                const reserveAttacks = parseInt(document.getElementById('bicanh-reserve-attacks')?.value || '0', 10);
                const socketEnabled = document.getElementById('bicanh-socket-enabled')?.checked || false;
                
                localStorage.setItem('reservebicanhAttacks', Math.max(0, Math.min(5, reserveAttacks)).toString());
                localStorage.setItem('bicanhSocketEnabled', socketEnabled ? '1' : '0');
                
                // Apply socket changes immediately
                if (socketEnabled) {
                    if (typeof bicanhhiente !== 'undefined' && bicanhhiente.startBossSocketListener) {
                        bicanhhiente.startBossSocketListener();
                    }
                } else {
                    if (typeof bicanhhiente !== 'undefined' && bicanhhiente.stopBossSocketListener) {
                        bicanhhiente.stopBossSocketListener();
                    }
                }
                saved = true;
                break;
        }
        
        if (saved) {
            showNotification('✅ Đã lưu cài đặt!', 'success', 2000);
            // Close modal after short delay
            setTimeout(() => {
                document.getElementById('unified-settings-modal').style.display = 'none';
            }, 500);
        }
    } catch (error) {
        console.error('[Settings] Error saving:', error);
        showNotification('❌ Lỗi khi lưu cài đặt', 'error');
    }
}

// ===============================================
// NHẬP MÃ THƯỞNG (PROMO CODE)
// ===============================================

async function submitPromoCode(promoCode) {
    const logPrefix = '[Nhập mã]';
    
    if (!promoCode || promoCode.trim() === '') {
        showNotification(`${logPrefix} ⚠️ Mã CODE không hợp lệ`, 'warning');
        return;
    }

    try {
        // Lấy nonce từ trang linh thạch
        const nonce = await getSecurityNonce( weburl + "linh-thach?t","redeem_linh_thach");

        if (!nonce) {
            showNotification(`${logPrefix} ❌ Không thể lấy nonce`, 'error');
            return;
        }

        showNotification(`${logPrefix} 📤 Đang nhập mã: ${promoCode}...`, 'info');

        const response = await fetch(ajaxUrl, {
            credentials: "include",
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0) Gecko/20100101 Firefox/143.0",
                "Accept": "*/*",
                "Accept-Language": "vi,en-US;q=0.5",
                "Content-Type": "application/x-www-form-urlencoded",
                "X-Requested-With": "XMLHttpRequest",
                "Sec-Fetch-Dest": "empty",
                "Sec-Fetch-Mode": "cors",
                "Sec-Fetch-Site": "same-origin",
                Priority: "u=0"
            },
            body: `action=redeem_linh_thach&code=${encodeURIComponent(promoCode)}&nonce=${nonce}&lt_token=${securityToken}&hold_timestamp=${Math.floor(
                Date.now() / 1000
            )}`,
            method: "POST",
            mode: "cors"
        });

        const data = await response.json();

        if (data.success) {
            showNotification(`${logPrefix} ✅ ${data.data.message}`, 'success');
            // Lưu mã đã nhập vào localStorage
            localStorage.setItem(`promo_code_${accountId}`, promoCode);
            // Xóa input
            const input = document.getElementById('promo-code-input');
            if (input) input.value = '';
        } else if (data.data?.message === "⚠️ Đạo hữu đã hấp thụ linh thạch này rồi!") {
            showNotification(`${logPrefix} ${data.data.message || JSON.stringify(data)}`, 'warn');
            localStorage.setItem(`promo_code_${accountId}`, promoCode);
        } else {
            showNotification(`${logPrefix} ❌ ${data.data?.message || data.message || "Không xác định"}`, 'error');
        }
    } catch (error) {
        console.error(`${logPrefix} Lỗi:`, error);
        showNotification(`${logPrefix} ❌ Lỗi: ${error.message}`, 'error');
    }
}

// ===============================================
// VẤN ĐÁP
// ===============================================

class VanDap {
    constructor(nonce) {
        this.nonce = nonce;
        this.ajaxUrl = ajaxUrl;
        const VanDapfileName = "/VanDap.json";
        const VanDapUrl = baseUrl + repoPath + branch + VanDapfileName;
        this.QUESTION_DATA_URL = VanDapUrl;
        this.taskTracker = taskTracker;
        this.questionDataCache = null;
    }

    // 🔧 normalizeText riêng
    normalizeText(str) {
        return str
            .normalize("NFC")   // chuẩn hóa Unicode
            .toLowerCase()
            .trim()
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?\s]/g, '');
    }


      tokenize(str) {
        if (typeof str !== "string") return [];
        return str
            .toLowerCase()
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, ' ')
            .trim()
            .split(/\s+/)
            .filter(x => x);
    }

    /**
     * Tải dữ liệu đáp án và lưu vào cache.
     */
async loadAnswersFromHub() {
        try {
            // ép tải mới bằng cách thêm timestamp
            const urlWithBypass = this.QUESTION_DATA_URL + "?t=" + Date.now();
            const response = await fetch(urlWithBypass, { cache: "no-store" });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            this.questionDataCache = await response.json();

            console.log("[Vấn Đáp] ✅ Đã tải dữ liệu mới từ hub:", urlWithBypass);
        } catch (e) {
            showNotification('Lỗi khi tải đáp án. Vui lòng thử lại.', 'error');
            throw e;
        }
    }

    /**
     * Kiểm tra câu hỏi trong cache và gửi đáp án lên server.
    */
        /**
    * Tìm câu trả lời đúng cho một câu hỏi và gửi nó đi.
    * @param {object} question Đối tượng câu hỏi từ máy chủ.
    * @param {object} headers Headers của yêu cầu để gửi đi.
    * @returns {Promise<boolean>} True nếu câu trả lời được gửi thành công, ngược lại là false.
    */
async checkAnswerAndSubmit(question, headers) {

    const normalizedIncomingQuestion = this.normalizeText(question.question);// system question

    //check log câu hỏi từ hệ thống và câu hỏi từ hub
        console.log("Incoming Question (gốc):", question.question);
        console.log("Incoming Question (normalized):", normalizedIncomingQuestion);
        // console.log("Stored keys(normalized):", Object.keys(this.questionDataCache.questions).map(k => this.normalizeText(k)));

    let foundAnswer = null;
    let matchedQuestionKey = null;

    for (const storedQuestionKey in this.questionDataCache.questions) {
        const normalizedStoredQuestionKey = this.normalizeText(storedQuestionKey);
        if (normalizedStoredQuestionKey === normalizedIncomingQuestion) {
            matchedQuestionKey = storedQuestionKey;
            foundAnswer = this.questionDataCache.questions[storedQuestionKey];
            break;
        }
    }


    if (!foundAnswer) {
        console.warn("[Vấn Đáp] ❌ Không tìm thấy câu hỏi trong cache:", question.question, "Normalized Question:", normalizedIncomingQuestion);
        showNotification(`<b>Vấn Đáp:</b> Không tìm thấy đáp án cho câu hỏi: <i>${question.question}</i>`, 'error');
        return false;
    }

// Tìm chỉ mục (Index) trong options
  // Ưu tiên 1: Tìm chính xác (Exact Match)
    let answerIndex = question.options.findIndex(option =>
    this.normalizeText(option) === this.normalizeText(foundAnswer));
    //  console.log("Answer index:", answerIndex, "Option chosen:", question.options[answerIndex]);

  // Ưu tiên 2: Nếu không thấy, tìm theo điểm trùng từ (Similarity Score)
    if (answerIndex === -1) {

    let maxScore = -1;
    let bestIdx = -1;
    const targetTokens = this.tokenize(foundAnswer);
    question.options.forEach((option, idx) => {
        const optTokens = this.tokenize(option);
        const intersection = optTokens.filter(token => targetTokens.includes(token));
        const score = intersection.length;

        if (score > maxScore) {
            maxScore = score;
            bestIdx = idx;
        }
    });

    if (bestIdx > -1 && maxScore > 0) {
        answerIndex = bestIdx;
        console.log(`[Vấn Đáp] 🎯 Chọn option theo điểm cao nhất (${maxScore}): ${question.options[bestIdx]}`);
    }
        }
// Nếu vẫn không tìm thấy
    if (answerIndex === -1) {
        console.warn("[Vấn Đáp] ❌ Không khớp option nào.");
        console.warn("Options (gốc):", question.options);
        console.warn("Options (normalized):", question.options.map(opt => this.normalizeText(opt)));
        console.warn("Đáp án từ GitHub:", foundAnswer);
        console.log("Đáp án từ GitHub (normalized):", this.normalizeText(foundAnswer));
        //console.log("Unicode từng ký tự đáp án:", [...foundAnswer].map(c => c.charCodeAt(0).toString(16)));
        showNotification(`Vấn Đáp: Câu hỏi: <i>${question.question}</i> không có đáp án đúng trong server.`, 'error');
        return false;
    }

    const payloadSubmitAnswer = new URLSearchParams();
    payloadSubmitAnswer.append('action', 'save_quiz_result');
    payloadSubmitAnswer.append('question_id', question.id);
    payloadSubmitAnswer.append('answer', answerIndex);
    payloadSubmitAnswer.append('security_token', securityToken);

    //console.log("Submit payload:", { question_id: question.id, answer: answerIndex, security_token: securityToken });

    try {
        const responseSubmit = await fetch(this.ajaxUrl, {
            method: 'POST',
            headers: headers,
            body: payloadSubmitAnswer,
            credentials: 'include'
        });

        const dataSubmit = await responseSubmit.json();

        //console.log("Server response:", dataSubmit);

        if (dataSubmit.success) {
            return { success: true };
        } else {
            const msg = dataSubmit?.data?.message || dataSubmit?.message || "Server không trả về thông điệp lỗi";
            return { success: false, reason: "server_error", message: msg };
        }
    } catch (error) {
        const msg = error?.message || JSON.stringify(error) || "Lỗi không xác định";
        return { success: false, reason: "exception", message: msg };
    }
}


    /**
     * Thực hiện toàn bộ quy trình vấn đáp.
     */
    async doVanDap(nonce) {
        const securityToken = await getSecurityToken(weburl + 'van-dap-tong-mon?t');
        try {
            await this.loadAnswersFromHub();

            console.log('[HH3D Vấn Đáp] ▶️ Bắt đầu Vấn Đáp');
            const headers = {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With': 'XMLHttpRequest',
                'X-Wp-Nonce': nonce,
            };

            let correctCount = 0;
            let answeredThisSession = 0;
            const maxAttempts = 10;
            let currentAttempt = 0;
            let totalQuestions = 0;

            while (correctCount < 5 && currentAttempt < maxAttempts) {
                currentAttempt++;
                const payloadLoadQuiz = new URLSearchParams();
                payloadLoadQuiz.append('action', 'load_quiz_data');
                payloadLoadQuiz.append('security_token', securityToken);

                const responseQuiz = await fetch(this.ajaxUrl, {
                    method: 'POST',
                    headers: headers,
                    body: payloadLoadQuiz,
                    credentials: 'include'
                });

                const dataQuiz = await responseQuiz.json();

                if (!dataQuiz.success || !dataQuiz.data) {
                    showNotification(`Vấn Đáp: ${dataQuiz.data || 'Lỗi khi lấy câu hỏi'}`, 'warn');
                    return;
                }

                if (dataQuiz.data.completed) {
                    showNotification('Đã hoàn thành vấn đáp hôm nay.', 'success');
                    taskTracker.markTaskDone(accountId, 'diemdanh');
                    return;
                }

                if (!dataQuiz.data.questions) {
                    showNotification(`Vấn Đáp: Không có câu hỏi nào được tải.`, 'warn');
                    return;
                }

                const questions = dataQuiz.data.questions;
                totalQuestions = questions.length;
                correctCount = dataQuiz.data.correct_answers || 0;

                // Bộ lọc câu hỏi bao hàm cả 2 trường hợp
                const questionsToAnswer = questions.filter(q => {
                    if ('is_correct' in q) {
                        return String(q.is_correct) === "0"; // chỉ lấy câu chưa đúng
                    }
                    return true; // nếu chưa có is_correct thì lấy tất cả
                });

                if (questionsToAnswer.length === 0) {
                    break;
                }

                let newAnswersFound = false;

        for (const question of questionsToAnswer) {
            //console.log(`Đang xử lý câu hỏi #${question.id}: ${question.question}`);
            const result = await this.checkAnswerAndSubmit(question, headers,securityToken);

            if (result.success) {
                answeredThisSession++;
                // correctCount++;
                newAnswersFound = true;
                //showNotification(`✅ Trả lời đúng câu hỏi #${question.id}`, 'success'); // 🔧 thêm noti
            } else {
                if (result.reason === "not_in_cache") {
                    console.warn(`Không tìm thấy đáp án trong cache cho câu hỏi #${question.id}`);
                    showNotification(`❌ Không tìm thấy đáp án trong cache cho câu hỏi #${question.id}`, 'error'); // 🔧 thêm noti
                } else if (result.reason === "not_in_options") {
                    console.warn(`Đáp án có trong cache nhưng không khớp option server cho câu hỏi #${question.id}`);
                    showNotification(`❌ Đáp án không khớp option server cho câu hỏi #${question.id}`, 'error'); // 🔧 thêm noti
                } else if (result.reason === "server_error") {
                    console.error(`Server từ chối câu hỏi #${question.id}: ${result.message}`);
                    showNotification(`⚠️ Server từ chối câu hỏi #${question.id}: ${result.message}`, 'warn'); // 🔧 thêm noti
                } else if (result.reason === "exception") {
                    console.error(`Lỗi khi gửi câu hỏi #${question.id}: ${result.message}`);
                    showNotification(`⚠️ Lỗi khi gửi câu hỏi #${question.id}: ${result.message}`, 'warn'); // 🔧 thêm noti
                }
            }
        }

                if (!newAnswersFound) {
                    showNotification(`Vấn Đáp: Không tìm thấy câu trả lời mới, dừng lại.`, 'warn');
                    break;
                }

                if (correctCount < 5) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }

            // Tìm nạp trạng thái cuối cùng để báo cáo chính xác
            const finalPayload = new URLSearchParams();
            finalPayload.append('action', 'load_quiz_data');
            finalPayload.append('security_token', securityToken);

            const finalResponse = await fetch(this.ajaxUrl, {
                method: 'POST',
                headers: headers,
                body: finalPayload,
                credentials: 'include'
            });
            const finalData = await finalResponse.json();
            if (finalData.success && finalData.data) {
                correctCount = finalData.data.correct_answers || correctCount;
                totalQuestions = finalData.data.questions.length || totalQuestions;
            }

            showNotification(
                `Hoàn thành Vấn Đáp. Đã trả lời thêm ${answeredThisSession} câu. Tổng số câu đúng: ${correctCount}/${totalQuestions}`,
                'success'
            );

        } catch (e) {
            console.error(`[HH3D Vấn Đáp] ❌ Lỗi xảy ra:`, e);
            showNotification(`Lỗi khi thực hiện Vấn Đáp: ${e.message}`, 'error');
        }
    }
}

// ===============================================
// ĐIỂM DANH
// ===============================================
async function doDailyCheckin(nonce) {
    try {
            console.log('[HH3D Daily Check-in] ▶️ Bắt đầu Daily Check-in');
            const url = weburl + 'wp-json/hh3d/v1/action';
            const headers = {
                'Content-Type': 'application/json',
                'X-Wp-Nonce': nonce,
                'X-Requested-With': 'XMLHttpRequest'
            };

            const bodyPayload = {
                action: 'daily_check_in'
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(bodyPayload),
                credentials: 'include',
                referrer: weburl + 'diem-danh',
                mode: 'cors'
            });

            const data = await response.json();

            if (response.ok && data.success) {
                showNotification(`Điểm danh: ${data.message} (${data.streak} ngày)`, 'success');
            } else {
                showNotification(`Điểm danh: ${data.message || 'Lỗi không xác định'}`, 'warn');
            }
        } catch (e) {
            console.error(`[HH3D Daily Check-in] ❌ Lỗi xảy ra:`, e);
            showNotification(`Lỗi khi thực hiện Daily Check-in: ${e.message}`, 'error');
    }
}

// ===============================================
// TẾ LỄ TÔNG MÔN
// ===============================================
async function doClanDailyCheckin(nonce) {
    const securityToken = await getSecurityToken(weburl + 'danh-sach-thanh-vien-tong-mon?t');
    try {
        console.log('[HH3D Clan Check-in] ▶️ Bắt đầu Clan Check-in');

        // Giả định 'weburl' được định nghĩa ở scope bên ngoài
        const url = weburl + "wp-json/tong-mon/v1/te-le-tong-mon";

        // --- 1. CẬP NHẬT HEADERS ---
        const headers = {
            "Content-Type": "application/json",
            "X-WP-Nonce": nonce,
            "security_token": securityToken
        };

        // --- 2. CẬP NHẬT BODY ---
        const bodyPayload = {
            action: "te_le_tong_mon",
            security_token: securityToken
        };

        const response = await fetch(url, {
            "credentials": "include",
            "headers": headers, // (Đã cập nhật)
            "referrer": weburl + "danh-sach-thanh-vien-tong-mon",
            "body": JSON.stringify(bodyPayload), // <-- THAY ĐỔI TỪ "{}"
            "method": "POST",
            "mode": "cors"
        });

        // Logic xử lý response giữ nguyên
        const data = await response.json();
        if (response.ok && data.success) {
            showNotification(`Tế lễ: ${data.message} (${data.cong_hien_points})`, 'success');
        } else {
            showNotification(`Tế lễ: ${data.message || 'Lỗi không xác định'}`, 'warn');
        }
    } catch (e) {
        console.error(`[HH3D Clan Check-in] ❌ Lỗi xảy ra:`, e);
        showNotification(`Lỗi khi thực hiện Clan Check-in: ${e.message}`, 'error');
    }
}

// ===============================================
// HÀM ĐỔ THẠCH
// ===============================================

/**
* Lớp quản lý tính năng Đổ Thạch (Dice Roll).
*
* Hướng dẫn sử dụng:
* 1. Tạo một thực thể của lớp, cung cấp các phụ thuộc cần thiết.
*    const doThachManager = new DoThach();
*
* 2. Gọi phương thức run với chiến lược mong muốn ('tài' hoặc 'xỉu').
*    await doThachManager.run('tài');
*/
        class DoThach {
            constructor() {
                this.ajaxUrl = ajaxUrl;
                this.webUrl = weburl;
                this.getSecurityNonce = getSecurityNonce;
                this.doThachUrl = this.webUrl + 'do-thach-hh3d?t';
            }

    // --- Các phương thức private để gọi API và lấy nonce ---

    // async #getLoadDataNonce() {
    //     return this.getSecurityNonce(this.doThachUrl, /action: 'load_do_thach_data',[\s\S]*?security: '([a-f0-9]+)'/);
    // }

    // async #getPlaceBetNonce() {
    //     return this.getSecurityNonce(this.doThachUrl, /action: 'place_do_thach_bet',[\s\S]*?security: '([a-f0-9]+)'/);
    // }

    // async #getClaimRewardNonce() {
    //     return this.getSecurityNonce(this.doThachUrl, /action: 'claim_do_thach_reward',[\s\S]*?security: '([a-f0-9]+)'/);
    // }



            /**
            * Lấy thông tin phiên đổ thạch hiện tại.
            * @param {string} securityNonce - Nonce cho yêu cầu.
            * @returns {Promise<object|null>} Dữ liệu phiên hoặc null nếu có lỗi.
            */
            async #getDiceRollInfo() {
                console.log('[HH3D Đổ Thạch] ▶️ Đang lấy thông tin phiên...');
                const securityToken = await getSecurityToken(this.doThachUrl);
                //const payload = new URLSearchParams({ action: 'load_do_thach_data', security_token: securityToken, security: securityNonce });
                const payload = new URLSearchParams({ action: 'load_do_thach_data', security_token: securityToken});
                const headers = {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'X-Requested-With': 'XMLHttpRequest',
                };

                try {
                    const response = await fetch(this.ajaxUrl, { method: 'POST', headers, body: payload });
                    const data = await response.json();
                    if (data.success) {
                        console.log('[HH3D Đổ Thạch] ✅ Tải thông tin phiên thành công.');
                        return data.data;
                    }
                    console.error('[HH3D Đổ Thạch] ❌ Lỗi từ API:', data.data || 'Lỗi không xác định');
                    return null;
                } catch (e) {
                    console.error('[HH3D Đổ Thạch] ❌ Lỗi mạng:', e);
                    return null;
                }
            }

            /**
            * Đặt cược vào một viên đá cụ thể.
            * @param {object} stone - Đối tượng đá để đặt cược.
            * @param {number} betAmount - Số tiền cược.
            * @param {string} placeBetSecurity - Nonce để đặt cược.
            * @returns {Promise<boolean>} True nếu đặt cược thành công.
            */
            async #placeBet(stone, betAmount) {
                console.log(`[HH3D Đặt Cược] 🪙 Đang cược ${betAmount} Tiên Ngọc vào ${stone.name}...`);
                const securityToken = await getSecurityToken(this.doThachUrl);
                    const payload = new URLSearchParams({
                    action: 'place_do_thach_bet',
                    security_token: securityToken,
                    //security: placeBetSecurity, bỏ security nonce
                    stone_id: stone.stone_id,
                    bet_amount: betAmount
                });
                const headers = {
                    'Accept': '*/*',
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'X-Requested-With': 'XMLHttpRequest',
                };

                try {
                    const response = await fetch(this.ajaxUrl, { method: 'POST', headers, body: payload });
                    const data = await response.json();

                    if (data.success) {
                        showNotification(`✅ Cược thành công vào ${stone.name}!<br>Tỷ lệ <b>x${stone.reward_multiplier}</b>`, 'success');
                        this._alreadyClaimedReward = false; // reset flag
                        return true;
                    }
                    else if (data.data === 'Vui lòng nhận thưởng kỳ trước rồi mới tiếp tục đặt cược.') {
                        if (!this._alreadyClaimedReward) {
                            if (await this.#claimReward()) {
                                this._alreadyClaimedReward = true;
                                //return await this.#placeBet(stone, betAmount, placeBetSecurity);
                                return await this.#placeBet(stone, betAmount);
                            } else {
                                showNotification(`❌ Không thể nhận thưởng kỳ trước, vui lòng thử lại.`, 'error');
                            }
                        } else {
                            showNotification(`❌ Đã thử nhận thưởng nhưng vẫn không cược được.`, 'error');
                        }
                        this._alreadyClaimedReward = false; // reset flag
                        return false;
                    }

                    const errorMessage = data.data || data.message || 'Lỗi không xác định.';
                    showNotification(`❌ Lỗi cược: ${errorMessage}`, 'error');
                    this._alreadyClaimedReward = false;
                    return false;
                } catch (e) {
                    showNotification(`❌ Lỗi mạng khi cược: ${e.message}`, 'error');
                    this._alreadyClaimedReward = false;
                    return false;
                }
            }

            /**
            * Nhận thưởng cho một lần cược thắng.
            * @returns {Promise<boolean>} True nếu nhận thưởng thành công.
            */
            async #claimReward() {
                console.log('[HH3D Nhận Thưởng] 🎁 Đang nhận thưởng...');
                const securityToken = await getSecurityToken(this.doThachUrl);
                const payload = new URLSearchParams({ action: 'claim_do_thach_reward', security_token: securityToken });
                const headers = {
                    'Accept': 'application/json, text/javascript, */*; q=0.01',
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'X-Requested-With': 'XMLHttpRequest',
                };

                try {
                    const response = await fetch(this.ajaxUrl, { method: 'POST', headers, body: payload });
                    const data = await response.json();
                    if (data.success) {
                        const rewardMessage = data.data?.message || `Nhận thưởng thành công!`;
                        showNotification(rewardMessage, 'success');
                        return true;
                    }
                    const errorMessage = data.data?.message || 'Lỗi không xác định khi nhận thưởng.';
                    showNotification(errorMessage, 'error');
                    return false;
                } catch (e) {
                    console.error(e);
                    showNotification(`❌ Lỗi mạng khi nhận thưởng: ${e.message}`, 'error');
                    return false;
                }
            }

            // --- Phương thức public để chạy toàn bộ quy trình ---

            /**
            * Chạy toàn bộ quy trình đổ thạch dựa trên chiến lược đã chọn.
            * @param {string} stoneType - Chiến lược đặt cược ('tài' hoặc 'xỉu').
            */
            async run(stoneType) {
                console.log(`[HH3D Đổ Thạch] 🧠 Bắt đầu quy trình với chiến lược: ${stoneType}...`);

                const sessionData = await this.#getDiceRollInfo();

                if (!sessionData) {
                    console.error('[HH3D Đổ Thạch] ❌ Không thể lấy dữ liệu phiên, dừng lại.');
                    return;
                }

                const userBetStones = sessionData.stones.filter(stone => stone.bet_placed);

                // Bước 2: Kiểm tra trạng thái phiên và hành động (nhận thưởng hoặc đặt cược)
                if (sessionData.winning_stone_id) {
                    console.log('[HH3D Đổ Thạch] 🎁 Đã có kết quả. Kiểm tra nhận thưởng...');
                    const claimableWin = userBetStones.find(s => s.stone_id === sessionData.winning_stone_id && !s.reward_claimed);
                    const alreadyClaimed = userBetStones.find(s => s.stone_id === sessionData.winning_stone_id && s.reward_claimed);

                    if (claimableWin) {
                        console.log(`[HH3D Đổ Thạch] 🎉 Trúng rồi! Đá cược: ${claimableWin.name}. Đang nhận thưởng...`);
                        await this.#claimReward();
                    } else if (alreadyClaimed) {
                        console.log(`[HH3D Đổ Thạch] ✅ Đã nhận thưởng cho phiên này.`);
                    } else if (userBetStones.length > 0) {
                        showNotification('[Đổ Thạch] 🥲 Rất tiếc, bạn không trúng phiên này.', 'info');
                    } else {
                        showNotification('[Đổ Thạch] 😶 Bạn không tham gia phiên này.', 'info');
                    }
                    taskTracker.updateTask(accountId, 'dothach', 'reward_claimed', 'true')
                    return;
                }

                // Bước 3: Nếu đang trong giờ cược, tiến hành đặt cược
                console.log('[HH3D Đổ Thạch] 💰 Đang trong thời gian đặt cược.');
                const userBetCount = userBetStones.length;

                if (userBetCount >= 2) {
                    showNotification('[Đổ Thạch] ⚠️ Đã cược đủ 2 lần. Chờ phiên sau.', 'warn');
                    taskTracker.updateTask(accountId, 'dothach', 'betplaced', true);

                    return;
                }

                const sortedStones = [...sessionData.stones].sort((a, b) => b.reward_multiplier - a.reward_multiplier);
                const availableStones = sortedStones.filter(stone => !stone.bet_placed);

                if (availableStones.length === 0) {
                    showNotification('[Đổ Thạch] ⚠️ Không còn đá nào để cược!', 'warn');
                    return;
                }

                const betAmount = 20;
                const stonesToBet = [];
                const normalizedStoneType = stoneType.toLowerCase();
                const betsRemaining = 2 - userBetCount;

                if (normalizedStoneType === 'tài' || normalizedStoneType === 'tai') {
                    stonesToBet.push(...availableStones.slice(0, betsRemaining));
                } else if (normalizedStoneType === 'xỉu' || normalizedStoneType === 'xiu') {
                    const xiuStones = availableStones.slice(2, 4);
                    stonesToBet.push(...xiuStones.slice(0, betsRemaining));
                } else {
                    console.log('[HH3D Đổ Thạch] ❌ Chiến lược không hợp lệ. Vui lòng chọn "tài" hoặc "xỉu".');
                    return;
                }

                if (stonesToBet.length === 0) {
                    console.log('[HH3D Đổ Thạch] ⚠️ Không có đá nào phù hợp chiến lược hoặc đã cược đủ.');
                    return;
                }

                let successfulBets = 0;
                for (const stone of stonesToBet) {
                    //const success = await this.#placeBet(stone, betAmount, placeBetSecurity);
                    const success = await this.#placeBet(stone, betAmount);
                    if (success) {
                        successfulBets++;
                    }
                }

                // Kiểm tra và cập nhật trạng thái ngay sau khi cược
                if (userBetCount + successfulBets >= 2) {
                    taskTracker.updateTask(accountId, 'dothach', 'betplaced', true);
                    //console.log(taskTracker.getTaskStatus(accountId, 'dothach'));

                }
            }
        }

//===================================
// TIÊN DUYÊN
//===================================
class TienDuyen {
    nonce;

    constructor() {
        this.apiUrl = weburl + "wp-json/hh3d/v1/action";
    }

    async init() {
        console.log("Chạy init tiên duyên");
        this.nonce = await getNonce();
        //console.log("getNonce type:", typeof getNonce);
        //console.log("getNonce source:", getNonce.toString());
        console.log("Tiên Duyên Nonce (init):", this.nonce);

        this.securityToken = await getSecurityToken(weburl + "tien-duyen?t");
        console.log("Tiên Duyên SecurityToken (init):", this.securityToken);
    }

    async #post(action, body = {}) {
        const res = await fetch(this.apiUrl, {
            credentials: "include",
            method: "POST",
            headers: {
                "Accept": "*/*",
                "Content-Type": "application/json",
                "X-WP-Nonce": this.nonce
            },
            body: JSON.stringify({ action, ...body })
        });
        return res.json();
    }

    // 📋 Lấy danh sách phòng cưới
    async getWeddingRooms() {
        console.log("Tiên Duyên SecurityToken (GetWedding Rooms):", this.securityToken);
        return await this.#post("show_all_wedding", {
            security_token: this.securityToken
        });
    }

    // 🎉 Chúc phúc
    async addBlessing(weddingRoomId, message = "Chúc phúc trăm năm hạnh phúc 🎉") {
        return await this.#post("hh3d_add_blessing", {
            wedding_room_id: weddingRoomId,
            message
        });
    }

    // 🧧 Nhận lì xì
    async receiveLiXi(weddingRoomId) {
        return await this.#post("hh3d_receive_li_xi", {
            wedding_room_id: weddingRoomId
        });
    }

    // 💞 Duyên: chúc phúc + nhận lì xì
    async doTienDuyen() {
        if (!this.nonce || !this.securityToken) { 
            console.log("▶ Chưa init, đang chạy init trong doTienDuyen...");
            await this.init(); 
        }

        const lastCheck = taskTracker.getLastCheckTienDuyen(accountId);
        const now = new Date();
        if (now - lastCheck < 1800000) return;

        const list = await this.getWeddingRooms();
        if (!list?.data) {
            showNotification("Không có danh sách phòng cưới", "warn");
            return;
        }

        for (const room of list.data) {
            taskTracker.setLastCheckTienDuyen(accountId, now);
            console.log(`👉 Kiểm tra phòng ${room.wedding_room_id}`);

            if (room.has_blessed === false) {
                const bless = await this.addBlessing(room.wedding_room_id);
                if (bless && bless.success === true) {
                    showNotification(
                        `Bạn đã gửi lời chúc phúc cho cặp đôi <br><b>${room.user1_name} 💞 ${room.user2_name}</b>`,
                        "success"
                    );
                }
            }

            if (room.has_li_xi === true) {
                const liXi = await this.receiveLiXi(room.wedding_room_id);
                if (liXi && liXi.success === true) {
                    showNotification(
                        `Nhận lì xì phòng cưới ${room.wedding_room_id} được <b>${liXi.data.amount} ${liXi.data.name}</b>!`,
                        "success"
                    );
                }
            }

            // ⏳ Chờ 1 giây tránh spam
            await new Promise(r => setTimeout(r, 1000));
        }
    }
}

// ===============================================
// TIÊN DUYÊN - TẶNG HOA
// ===============================================

class TangHoa {
    nonce;
    initialized = false;

    constructor() {
        this.apiUrl = weburl + "wp-json/hh3d/v1/action";
        this.accountId = accountId;
                }

    async init() {
        // console.log("chạy tặng hoa");
        this.nonce = await getNonce();
        // console.log("getNonce type:", typeof getNonce);
        // console.log("getNonce source:", getNonce.toString());
        this.securityToken = await getSecurityToken(weburl + 'tien-duyen?t');
        this.initialized = true;
    }

    async #post(action, body = {}) {
        const res = await fetch(this.apiUrl,
                    {
            credentials: "include",
            method: "POST",
            headers: {
                        "Accept": "*/*",
                        "Content-Type": "application/json",
                        "X-WP-Nonce": this.nonce
                    },
            body: JSON.stringify({ action, ...body
                        })
                    });
        return res.json();
                }
    // Lấy danh sách bạn bè
    async getFriends() {
        return await this.#post("get_friends_td");
                }
    // Kiểm tra giới hạn quà tặng
    async checkGiftLimit(friendId, costType = "tien_ngoc") {
        return await this.#post("check_daily_gift_limit",
        {
            user_id: this.accountId,
            friend_id: friendId, // user_id của bạn bè
            cost_type: costType
        });
    }
    // Tặng quà
    async giftToFriend(friendId, giftType = "hoa_hong", costType = "tien_ngoc") {
        return await this.#post("gift_to_friend",
        {
            user_id: this.accountId,
            friend_id: friendId, // user_id của bạn bè
            gift_type: giftType,
            cost_type: costType
        });
    }
    // Hàm chính: tặng hoa cho đúng số người đã chọn
    async run(selectedCount) {
        try {
            if (!this.initialized) {
                await this.init();
                            }

            const count = parseInt(selectedCount,
                            10);
            if (Number.isNaN(count) || count <= 0) {
                showNotification(`⚠️ Số lượng chọn không hợp lệ: ${selectedCount
                                }`, 'warn');
                return;
                            }

            const friendsRes = await this.getFriends();
            const list = Array.isArray(friendsRes?.data)
                ? friendsRes.data
                : (Array.isArray(friendsRes) ? friendsRes : []);

            if (!Array.isArray(list) || list.length === 0) {
                showNotification("❌ Không có danh sách bạn bè", 'error');
                return;
                            }
                            // Lấy đúng số người đã chọn trên menu
            const targetFriends = list.slice(0, count);
            //showNotification(`🎯 Sẽ tặng cho ${targetFriends.length} người.`, 'info');

            let processed = 0;

            for (const friend of targetFriends) {
                const friendId = friend?.user_id;
                if (!friendId) {
                    showNotification("⚠️ Thiếu user_id trong item", 'warn');
                    continue;
                                }

                processed++;
                showNotification(`👤 Bắt đầu tặng cho ID ${friendId
                                } (${processed
                                }/${targetFriends.length
                                })`, 'info');

                let giftsForThisFriend = 0;
                const maxGiftsPerFriend = 3;

                while (giftsForThisFriend < maxGiftsPerFriend) {
                    const check = await this.checkGiftLimit(friendId);
                    const remaining = Number(check?.remaining_free_gifts ?? 0);

                    if (remaining <= 0) {
                        showNotification(`⛔ Hết lượt tặng cho ID ${friendId
                                        }, dừng tặng người này.`, 'warn');
                        break;
                                    }

                    const gift = await this.giftToFriend(friendId);
                    if (gift?.success === true) {
                        giftsForThisFriend++;
                        //const remainingAfter = gift?.remaining_free_gifts ?? 'N/A';
                        showNotification(`🎁 Tặng lần ${giftsForThisFriend
                                        }/${maxGiftsPerFriend
                                        }`, 'success');
                                    } else {
                        showNotification(`⚠️ Tặng quà thất bại cho ID ${friendId
                                        }`, 'error');
                        break;
                                    }

                    await new Promise(r => setTimeout(r,
                                    2000));
                                }

                await new Promise(r => setTimeout(r,
                                1000));
                            }

            showNotification(`🎉 Kết thúc: đã xử lý ${processed
                            }/${targetFriends.length
                            } người`, 'success');
                        } catch (err) {
            showNotification(`💥 Lỗi trong run(): ${err?.message ?? err
                            }`, 'error');
                        }
                    }
                }

    // ===============================================
    // TIÊN DUYÊN - CẦU NGUYỆN
    // ===============================================

async function docaunguyen(accountId) {
        const logPrefix = "[Cầu Nguyện tiên duyên]";
    try {

        console.log(logPrefix, "▶️ Đang thực hiện...");

        const nonce = await getNonce();
        if (!nonce) {
            showNotification("Không lấy được nonce", "error");
            return false;
        }

        const url = weburl + "wp-json/hh3d/v1/action";
        const bodyPayload = { action: "make_wish_tree" };

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Wp-Nonce": nonce,
                "X-Requested-With": "XMLHttpRequest"
            },
            body: JSON.stringify(bodyPayload),
            credentials: "include"
        });

        const data = await response.json();

        if (
            data.success ||
            (data.message && data.message.includes("Chưa có đạo lữ để ước nguyện Tiên Duyên Thụ"))
        ) {
            showNotification(`${logPrefix} ✨ ${data.message}`, "info");
            taskTracker.markTaskDone(accountId, "tienduyen");
            return true;
        } else {
            showNotification(`${logPrefix}⚠️ ${data.message || "Thất bại"}`, "warn");
            return false;
        }
    } catch (e) {
        console.error(e);
        showNotification(`${logPrefix}: ${e.message}`, "error");
        return false;
    }
}


// ===============================================
        // THÍ LUYỆN TÔNG MÔN
        // ===============================================

    async function doThiLuyenTongMon() {
    console.log('[HH3D Thí Luyện Tông Môn] ▶️ Bắt đầu Thí Luyện Tông Môn');

    // Bước 1: Lấy security token
    const securityToken = await getSecurityToken(weburl + 'thi-luyen-tong-mon-hh3d?t');
    if (!securityToken) {
        showNotification('Lỗi khi lấy security token cho Thí Luyện Tông Môn.', 'error');
        throw new Error('Lỗi khi lấy security token cho Thí Luyện Tông Môn.');
    }

    const url = ajaxUrl;
    const payload = new URLSearchParams();
    payload.append('action', 'open_chest_tltm');
    payload.append('security_token', securityToken);

    console.log([...payload.entries()]);

    const headers = {
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: payload,
            credentials: 'include' // Quan trọng để gửi cookies
        });

        // Đọc body một lần
        const text = await response.text();
        console.log(text);
        // Parse JSON từ text
        const data = JSON.parse(text);

        if (data.success) {
            // Trường hợp thành công
            const message = data.data && data.data.message ? data.data.message : 'Mở rương thành công!';
            showNotification(message, 'success');
        } else {
            // Trường hợp thất bại
            const errorMessage = data.data && data.data.message ? data.data.message : 'Lỗi không xác định khi mở rương.';
            if (errorMessage.includes("Đã hoàn thành Thí Luyện Tông Môn hôm nay")) {
                showNotification(errorMessage, 'info');
                taskTracker.markTaskDone(accountId, 'thiluyen');
            } else {
                showNotification(errorMessage, 'error');
            }
        }


    } catch (e) {
        showNotification(`Lỗi mạng khi thực hiện Thí Luyện: ${e.message}`, 'error');
    }
}

        // ===============================================
        // PHÚC LỢI
        // ===============================================


async function doPhucLoiDuong() {
    const logPrefix = '[HH3D Phúc Lợi Đường]';
    console.log(`${logPrefix} ▶️ Bắt đầu nhiệm vụ Phúc Lợi Đường.`);
    // Bước 1: Lấy security nonce từ trang hoặc fallback sang AJAX
    let securityNonce = null;
    try {
        const resp= await fetch(weburl + 'phuc-loi-duong?t');
        const jsonConfigMatch = await resp.text();
        const match = jsonConfigMatch.match(/"securityToken"\s*:\s*"([^"]+)"/);
        if (match && match[1]) {
            securityNonce = match[1];
            console.log('[HH3D Phúc Lợi Đường] ✅ Nonce từ HTML:', securityNonce);
        }
    } catch (err) {
        console.warn('[HH3D Phúc Lợi Đường] ⚠️ Lỗi khi parse HTML:', err);
    }

    if (!securityNonce) {
        try {
            const resAjax = await fetch(weburl + 'wp-content/themes/halimmovies-child/hh3d-ajax.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                body: 'action=get_next_time_pl',
                credentials: 'include'
            });
            const dataAjax = await resAjax.json();
            if (dataAjax && dataAjax.security_token) {
                securityNonce = dataAjax.security_token;
                console.log('[HH3D Phúc Lợi Đường] ✅ Nonce từ AJAX:', securityNonce);
            }
        } catch (err) {
            console.error('[HH3D Phúc Lợi Đường] ❌ Lỗi khi gọi AJAX:', err);
        }
    }

    if (!securityNonce) {
        showNotification('Lỗi khi lấy security nonce cho Phúc Lợi Đường.', 'error');
        return;
    }

    const url = ajaxUrl;
    const headers = {
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
    };

    // Bước 2: Lấy thông tin thời gian còn lại và cấp độ rương
    console.log('[HH3D Phúc Lợi Đường] ⏲️ Đang kiểm tra thời gian mở rương...');
    const securityToken = await getSecurityToken(weburl + 'phuc-loi-duong?t');
    const payloadTime = new URLSearchParams();
    payloadTime.append('action', 'get_next_time_pl');
    payloadTime.append('security_token', securityToken);
    payloadTime.append('security', securityNonce);

    try {
        const responseTime = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: payloadTime,
            credentials: 'include'
        });
        const dataTime = await responseTime.json();

        if (dataTime.success) {
            const { time, chest_level: chest_level_string } = dataTime.data;
            const chest_level = parseInt(chest_level_string, 10);

            if (chest_level >= 4) {
                showNotification('Phúc Lợi Đường đã hoàn tất hôm nay!', 'success');
                taskTracker.markTaskDone(accountId, 'phucloi');
                return;
            }

            if (time === '00:00') {
                console.log(`[HH3D Phúc Lợi Đường] 🎁 Đang mở rương cấp ${chest_level + 1}...`);
                const payloadOpen = new URLSearchParams();
                payloadOpen.append('action', 'open_chest_pl');
                payloadOpen.append('security_token', securityToken);
                payloadOpen.append('security', securityNonce);
                payloadOpen.append('chest_id', chest_level + 1);

                const responseOpen = await fetch(url, {
                    method: 'POST',
                    headers: headers,
                    body: payloadOpen,
                    credentials: 'include'
                });
                const dataOpen = await responseOpen.json();

                if (dataOpen.success) {
                    const message = dataOpen.data && dataOpen.data.message ? dataOpen.data.message : 'Mở rương thành công!';
                    showNotification(message, 'success');
                    if (message.includes('đã hoàn thành Phúc Lợi ngày hôm nay')) {
                        taskTracker.markTaskDone(accountId, 'phucloi');
                    } else {
                        taskTracker.adjustTaskTime(accountId, 'phucloi', timePlus('30:00'));
                    }
                } else {
                    const errorMessage = dataOpen.data && dataOpen.data.message ? dataOpen.data.message : 'Lỗi không xác định khi mở rương.';
                    showNotification(errorMessage, 'error');
                }
            } else {
                showNotification(`Vui lòng đợi ${time} để mở rương tiếp theo.`, 'warn');
                taskTracker.adjustTaskTime(accountId, 'phucloi', timePlus(time));
            }
        } else {
            const errorMessage = dataTime.data && dataTime.data.message ? dataTime.data.message : 'Lỗi không xác định khi lấy thời gian.';
            showNotification(errorMessage, 'error');
        }
    } catch (e) {
        showNotification(`Lỗi mạng khi thực hiện Phúc Lợi Đường: ${e.message}`, 'error');
    }
}

async function phucloiclaimbonus() {
    const logPrefix = "[HH3D Phúc Lợi Claim Bonus]";
    const ajaxUrl = weburl + "wp-content/themes/halimmovies-child/hh3d-ajax.php";

    // Bước 1: Lấy security token từ trang hoặc fallback sang AJAX
    let securityToken = null;
    try {
        const resp = await fetch(weburl + "phuc-loi-duong?t", { credentials: "include" });
        const html = await resp.text();
        const match = html.match(/"securityToken"\s*:\s*"([^"]+)"/);
        if (match && match[1]) {
            securityToken = match[1];
            console.log(`${logPrefix} ✅ Security token từ HTML:`, securityToken);
        }
    } catch (err) {
        console.warn(`${logPrefix} ⚠️ Lỗi khi parse HTML:`, err);
    }

    if (!securityToken) {
        try {
            const resAjax = await fetch(ajaxUrl, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
                body: "action=get_next_time_pl",
                credentials: "include"
            });
            const dataAjax = await resAjax.json();
            if (dataAjax && dataAjax.security_token) {
                securityToken = dataAjax.security_token;
                console.log(`${logPrefix} ✅ Security token từ AJAX:`, securityToken);
            }
        } catch (err) {
            console.error(`${logPrefix} ❌ Lỗi khi gọi AJAX:`, err);
        }
    }

    if (!securityToken) {
        console.error(`${logPrefix} ❌ Không lấy được security token.`);
        return;
    }

    // Bước 2: Thử chest_id từ 1 đến 4
    for (let chestId = 1; chestId <= 4; chestId++) {
        const payload = new URLSearchParams();
        payload.append("action", "claim_bonus_reward");
        payload.append("security_token", securityToken);
        payload.append("chest_id", chestId);

        try {
            const response = await fetch(ajaxUrl, {
                method: "POST",
                headers: {
                    "Accept": "application/json, text/javascript, */*; q=0.01",
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                    "X-Requested-With": "XMLHttpRequest"
                },
                body: payload,
                credentials: "include"
            });

            const data = await response.json();
            // console.log(`${logPrefix} Chest ${chestId}:`, data);

            if (data.success) {
                showNotification(`${logPrefix} ✅ Chest ${chestId}: ${data.data?.message}`, "success");
            } else {
                showNotification(`${logPrefix} ⚠️ Chest ${chestId}: ${data.data?.message}`, "warn");
            }
        } catch (err) {
            showNotification(`${logPrefix} ❌ Lỗi khi gọi chest ${chestId}: ${err}`, "error");
        }
    }
}

// ===============================================
        // BÍ CẢNH
        // ===============================================
class BiCanh {
    constructor() {
        this.weburl = weburl;
        this.logPrefix = '[HH3D Bí Cảnh]';
    }

    async doBiCanh() {
        console.log(`${this.logPrefix} ▶️ Bắt đầu nhiệm vụ Bí Cảnh Tông Môn.`);

        // 1. Lấy nonce
        const nonce = await this.getNonce();
        if (!nonce) {
            showNotification('Lỗi: Không thể lấy nonce cho Bí Cảnh Tông Môn.', 'error');
            throw new Error('Lỗi nonce bí cảnh');
        }

        // 2. Lấy boss status
        let statusResp = await this.getBossStatus(nonce);
        console.log("[DEBUG lấy boss status]", statusResp);

        // Cập nhật % HP boss lên UI quest item Bí Cảnh
        if (statusResp?.boss?.hp_percentage != null) {
            window.bicanhBossHp = Number(statusResp.boss.hp_percentage);
            const bicanhProgressSpan = document.querySelector('.nv-quest-item[data-task-id="bicanh"] .quest-progress');
            if (bicanhProgressSpan) {
                const baseText = bicanhProgressSpan.textContent.replace(/\s*\([^)]*%\s*HP\)/g, '').trimEnd();
                bicanhProgressSpan.textContent = baseText + ` (${window.bicanhBossHp.toFixed(2)}% HP)`;
            }
        }

        // 3. Nếu có thưởng pending thì nhận
        if (statusResp?.has_pending_reward) {
            console.log(`${this.logPrefix} 🎁 Có thưởng chưa nhận, tiến hành nhận...`);
            const rewardResponse = await this.sendApiRequest('wp-json/tong-mon/v1/claim-boss-reward', 'POST', nonce, {});
            console.log("[DEBUG ClaimReward response]", rewardResponse)
            if (rewardResponse?.success) {
                showNotification(rewardResponse.message, 'success');
            }
            // Sau khi nhận thưởng, lấy lại boss status sạch
            statusResp = await this.getBossStatus(nonce);
            console.log("[DEBUG BossStatus sau khi nhận thưởng]", statusResp);

        }

        // 4. Kiểm tra cooldown
        await this.sleep(500);
        console.log("[DEBUG Trước khi check cooldown, statusResp]", statusResp);
        const canAttack = await this.checkAttackCooldown(nonce, statusResp);
        console.log("[DEBUG Kết quả checkAttackCooldown]: canattack", canAttack);
        if (!canAttack) return;

        // 5. Tấn công boss
        await this.sleep(500);
        await this.attackBoss(nonce);
    }

    async getNonce() {
        const nonce = await getSecurityNonce( weburl + 'bi-canh-tong-mon?t', "nonce");
        return nonce || null;
    }

    async getBossStatus(nonce) {
        console.log(`${this.logPrefix} 📡 Gọi API getBossStatus...`);
        const resp = await this.sendApiRequest('wp-json/tong-mon/v1/get-boss-status', 'POST', nonce, {});
        console.log("[DEBUG getBossStatus response]", resp);
        return resp;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

   async isReserveHold() {
        const nonce = await this.getNonce();
        if (!nonce) return false;

        // Lấy thông tin boss status
        const statusResp = await this.sendApiRequest('wp-json/tong-mon/v1/get-boss-status', 'POST', nonce, {});
        //console.log(`${this.logPrefix} Debug boss status:`, statusResp);

        const remaining = Number(statusResp?.attack_info?.remaining ?? 0);
        const reserve   = Number(localStorage.getItem('reserveBiCanhAttacks') || '0');
        console.log("[DEBUG isReserveHold] reserveBiCanhAttacks:", reserve);
    console.log("[DEBUG isReserveHold] remaining:", remaining);

        // Nếu có cấu hình giữ lượt và số lượt còn lại <= số lượt giữ → coi như đang giữ
        return reserve > 0 && remaining <= reserve;
    }

    async checkAttackCooldown(nonce, statusResp) {

    console.log(`${this.logPrefix} ⏲️ Đang kiểm tra thời gian hồi chiêu...`);
    const endpoint = 'wp-json/tong-mon/v1/check-attack-cooldown';

    try {
        const response = await this.sendApiRequest(endpoint, 'POST', nonce, {});
        console.log("[DEBUG checkAttackCooldown response]", response);
        // const statusResp = await this.getBossStatus(nonce);
        // console.log("[DEBUG BossStatus]", statusResp);

        // Nếu có thể tấn công
        if (response?.success && response.can_attack) {
            // Kiểm tra giữ lượt
            if (await this.isReserveHold()) {
                const msg = `Đang giữ lượt, không tấn công.`;
                console.log(`${this.logPrefix} 🛑 ${msg}`);
                showNotification(msg, 'info');
                // ❌ Không hiển thị countdown trong trường hợp giữ lượt
                //taskTracker.adjustTaskTime(accountId, 'bicanh', null);
                return false;
            }
            const statusResp = await this.sendApiRequest('wp-json/tong-mon/v1/get-boss-status', 'POST', nonce, {});
            const remaining = Number(statusResp?.attack_info?.remaining ?? 0);
            console.log(`${this.logPrefix} ✅ Có thể tấn công. Còn ${remaining} lượt.`);
            return true;
        }

        // Boss chết
        if (response?.success && response.message === 'Không có boss để tấn công') {
            await this.sleep(1000);
            const rewardResponse = await this.sendApiRequest('wp-json/tong-mon/v1/claim-boss-reward', 'POST', nonce, {});
            if (rewardResponse?.success) showNotification(rewardResponse.message, 'success');

            const contributionResponse = await this.sendApiRequest('wp-json/tong-mon/v1/contribute-boss', 'POST', nonce, {});
            if (contributionResponse) {
                showNotification(contributionResponse.message, contributionResponse.success ? 'success' : 'warn');
            }

            taskTracker.adjustTaskTime(accountId, 'bicanh', null);
            return false;
        }

        // Countdown hiển thị khi có cooldown_remaining (trừ trường hợp giữ lượt)
        if (Number.isFinite(response?.cooldown_remaining)) {
            console.log("[DEBUG Cooldown_remaining]", response.cooldown_remaining);
            taskTracker.adjustTaskTime(accountId, 'bicanh', Date.now() + response.cooldown_remaining * 1000);
        } else {
            console.log("[DEBUG Không có cooldown_remaining, reset taskTime]");
            taskTracker.adjustTaskTime(accountId, 'bicanh', null);
        }

        const message = response?.message || 'Không thể tấn công vào lúc này.';
        showNotification(`⏳ ${message}`, 'info');
        return false;

    } catch (e) {
        showNotification(`${this.logPrefix} ❌ Lỗi kiểm tra cooldown: ${e.message}`, 'error');
        return false;
    }
}

    async attackBoss(nonce) {
        console.log(`${this.logPrefix} 🔥 Đang khiêu chiến boss...`);
        const endpoint = 'wp-json/tong-mon/v1/attack-boss';

        try {
            const response = await this.sendApiRequest(endpoint, 'POST', nonce, {});
            if (response && response.success) {
                console.log("[DEBUG attackBoss response]", response);
                const message = response.message || `Gây ${response.damage} sát thương.`;
                showNotification(message, 'success');
                taskTracker.adjustTaskTime(accountId, 'bicanh', timePlus('07:00'));
            } else {
                const errorMessage = response?.message || 'Lỗi không xác định khi tấn công.';
                console.log("[DEBUG attackBoss errorMessage]", errorMessage);
                showNotification(errorMessage, 'error');
            }
        } catch (e) {
            showNotification(`Lỗi mạng khi tấn công boss Bí Cảnh: ${e.message}`, 'error');
        }
    }

    async isDailyLimit() {
        const endpoint = 'wp-json/tong-mon/v1/check-attack-cooldown';
        const nonce = await this.getNonce();
        if (!nonce) return false;

        try {
            const response = await this.sendApiRequest(endpoint, 'POST', nonce, {});
            return response && response.success && response.cooldown_type === 'daily_limit';
        } catch (e) {
            console.error(`${this.logPrefix} ❌ Lỗi kiểm tra cooldown:`, e);
            return false;
        }
    }

    async sendApiRequest(endpoint, method, nonce, body = {}) {
        try {
            const url = `${this.weburl}${endpoint}`;
            const headers = {
                "Content-Type": "application/json",
                "X-WP-Nonce": nonce,
                "Accept": "*/*",
                "Accept-Language": "vi,en-US;q=0.5",
                "X-Requested-With": "XMLHttpRequest",
            };
            const response = await fetch(url, {
                method,
                headers,
                body: JSON.stringify(body),
                credentials: 'include'
            });
            return await response.json();
        } catch (error) {
            console.error(`${this.logPrefix} ❌ Lỗi khi gửi yêu cầu tới ${endpoint}:`, error);
            throw error;
        }
    }
}


        // ===============================================
        // BÍ CẢNH HIẾN TẾ
        // ===============================================
    class BiCanhHienTe {
        constructor() {
        this.weburl = weburl;
            this.logPrefix = "[HH3D Bí Cảnh Socket]";
            this.biCanhSocketActive = false;
            this.biCanhSocketWaiter = null;
            this.handledBossIds = new Set();
            this.currentDay = this.getTodayKey();
            this.currentBossId = null;
        }

        getTodayKey() {
            const d = new Date();
            return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
        }

        resetIfNewDay() {
            const today = this.getTodayKey();
            if (today !== this.currentDay) {
                this.currentDay = today;
                this.handledBossIds.clear();
                console.log(`${this.logPrefix} 🔄 Reset handledBossIds vì sang ngày mới`);
                showNotification(`${this.logPrefix} 🔄 Reset handledBossIds vì sang ngày mới`,'info');
            }
        }

        async sendApiRequest(endpoint, method, nonce, body = {}) {
            try {
                const url = `${this.weburl}${endpoint}`;
                const headers = {
                    "Content-Type": "application/json",
                    "X-WP-Nonce": nonce,
                    "Accept": "*/*",
                    "Accept-Language": "vi,en-US;q=0.5",
                    "X-Requested-With": "XMLHttpRequest",
                };
                const response = await fetch(url, {
                    method,
                    headers,
                    body: JSON.stringify(body),
                    credentials: 'include'
                });
                return await response.json();
            } catch (error) {
                console.error(`${this.logPrefix} ❌ Lỗi khi gửi yêu cầu tới ${endpoint}:`, error);
                showNotification(`${this.logPrefix} ❌ Lỗi khi gửi yêu cầu tới ${endpoint}:`, error);
                throw error;
            }
        }

        async updateCurrentBossId() {
            const nonce = await getNonce();
            if (!nonce) {
                console.error(`${this.logPrefix} ❌ Không lấy được nonce`);
                showNotification(`${this.logPrefix} ❌ Không lấy được nonce`,'info)');
                return null;
            }
            const res = await this.sendApiRequest("wp-json/tong-mon/v1/get-boss-status", "POST", nonce, {});
            //console.log(`${this.logPrefix} 📦 Response get-boss-status:`, res);
            //showNotification(`${this.logPrefix} 📦 Response get-boss-status:`, res,'info');

            if (res?.boss?.id) {
                this.currentBossId = res.boss.id;
                // console.log(`${this.logPrefix} 🎯 Current boss id set to ${this.currentBossId}`);
                // showNotification(`${this.logPrefix} 🎯 Current boss id set to ${this.currentBossId}`);
            } else {
                console.warn(`${this.logPrefix} ⚠️ Không tìm thấy boss id trong response`);
                showNotification(`${this.logPrefix} ⚠️ Không tìm thấy boss id trong response`,'info');
            }
            return this.currentBossId;
        }


        async handleBossDefeated(bossId) {
            this.resetIfNewDay();
            if (this.handledBossIds.has(bossId)) return;
            this.handledBossIds.add(bossId);

            showNotification(`💀 Boss ${bossId} chết! Chuẩn bị hiến tế...`, "warn");

            // Delay ngẫu nhiên trước khi bắt đầu
            const initialDelay = Math.floor(Math.random() * 1000) + 2000;
            await new Promise(resolve => setTimeout(resolve, initialDelay));

            const nonce = await getNonce();
            if (!nonce) {
                console.error(`${this.logPrefix} ❌ Không lấy được nonce`);
                showNotification(`${this.logPrefix} ❌ Không lấy được nonce`,'info');
                return;
            }

            // Hàm gọi API với retry/backoff - retry tối đa 3 lần
            const safeApiCall = async (endpoint, body = {}, retries = 3) => {
                for (let i = 0; i < retries; i++) {
                    try {
                        return await this.sendApiRequest(endpoint, "POST", nonce, body);
                    } catch (err) {
                        if (i < retries - 1) {
                            const backoff = (i + 1) * 1000; // tăng dần: 1s, 2s, 3s
                            console.warn(`${this.logPrefix} ⚠️ Lỗi khi gọi ${endpoint}, thử lại sau ${backoff}ms`);
                            showNotification(`${this.logPrefix} ⚠️ Lỗi khi gọi ${endpoint}, thử lại sau ${backoff}ms`,'info');

                            await new Promise(r => setTimeout(r, backoff));
                        } else {
                            console.error(`${this.logPrefix} ❌ Gọi ${endpoint} thất bại sau ${retries} lần`);
                            throw err;
                        }
                    }
                }
            };

            // Nhận thưởng
            const reward = await safeApiCall("wp-json/tong-mon/v1/claim-boss-reward");
            if (reward?.success) showNotification(reward.message, "success");

            // Delay trước khi hiến tế
            const contribDelay = Math.floor(Math.random() * 1000) + 2000;
            await new Promise(resolve => setTimeout(resolve, contribDelay));

            // Hiến tế
            const contrib = await safeApiCall("wp-json/tong-mon/v1/contribute-boss");
            if (contrib?.success) showNotification(contrib.message, "success");
        }



        // Check event
        async processBossEvent(event, data) {
            if (!this.biCanhSocketActive || !data) return;
            const bossId = data.boss_id;

            if (bossId !== this.currentBossId) return;
            console.log(`[BiCanh] ${event} cho boss ${bossId}:`, data);
            if (event === "boss_tm_hp_update") {

                // Hiển thị rõ thông tin HP boss
                const { current_hp, max_hp, hp_percentage } = data;
                showNotification(`[BiCanh] Boss ${bossId}: HP ${current_hp}/${max_hp} (${Number(hp_percentage).toFixed(2)}%)`, 'info');

                // Cập nhật trực tiếp vào UI quest item Bí Cảnh
                window.bicanhBossHp = Number(hp_percentage);
                const bicanhProgressSpan = document.querySelector('.nv-quest-item[data-task-id="bicanh"] .quest-progress');
                if (bicanhProgressSpan) {
                    // Giữ nguyên text tiến độ gốc (ví dụ: " 5/5"), chỉ thay phần HP
                    const baseText = bicanhProgressSpan.textContent.replace(/\s*\([^)]*%\s*HP\)/g, '').trimEnd();
                    bicanhProgressSpan.textContent = baseText + ` (${Number(hp_percentage).toFixed(2)}% HP)`;
                }

                if (Number(current_hp) === 0) {
                    await this.handleBossDefeated(bossId);
                }
            } else if (event === "boss_tm_defeated") {
                showNotification(`[BiCanh] Boss ${bossId} đã bị đánh bại!`, 'warn');
                await this.handleBossDefeated(bossId);
            } else {
                // Các event khác giữ nguyên
                showNotification(`[BiCanh] ${event} cho boss ${bossId}:`, data);
            }
        }

        async startBossSocketListener() {
            if (this.biCanhSocketActive) return;
            this.biCanhSocketActive = true;
            // console.log(`${this.logPrefix} ▶️ Bắt đầu startBossSocketListener`);
            // showNotification(`${this.logPrefix} ▶️ Bắt đầu startBossSocketListener`);
            if (this.biCanhSocketWaiter) clearInterval(this.biCanhSocketWaiter);
            this.biCanhSocketWaiter = setInterval(async () => {
                if (typeof socket !== "undefined" && typeof socket.on === "function") {
                    clearInterval(this.biCanhSocketWaiter);
                    this.biCanhSocketWaiter = null;

                    // console.log(`${this.logPrefix} ✅ Socket sẵn sàng, gọi updateCurrentBossId...`);
                    // showNotification(`${this.logPrefix} ✅ Socket sẵn sàng, gọi updateCurrentBossId...`, "info");
                    await this.updateCurrentBossId();
                    //showNotification(`${this.logPrefix} theo dõi bossId=${this.currentBossId})`, "info");
                    if (typeof socket.off === "function") {
                        socket.off("boss_tm_hp_update");
                        socket.off("boss_tm_defeated");
                    }

                    socket.on("boss_tm_hp_update", (data) => this.processBossEvent("boss_tm_hp_update", data));
                    socket.on("boss_tm_defeated", (data) => this.processBossEvent("boss_tm_defeated", data));

                    showNotification(`Đã kết nối socket Bí Cảnh (theo dõi bossId=${this.currentBossId})`, "info");
                }
            }, 200);
        }


        stopBossSocketListener() {
            //showNotification(`${this.logPrefix} (bossId=${this.currentBossId}) trước khi clear`,'info');
            this.biCanhSocketActive = false;
            this.handledBossIds.clear();
            // console.log(`${this.logPrefix} ⏹️ Reset handledBossIds khi stop listener (bossId=${this.currentBossId})`);
            //  showNotification(`${this.logPrefix} ⏹️ Reset handledBossIds khi stop listener (bossId=${this.currentBossId})`,'info');
            if (this.biCanhSocketWaiter) {
                clearInterval(this.biCanhSocketWaiter);
                this.biCanhSocketWaiter = null;
            }

            if (typeof socket !== "undefined" && typeof socket.off === "function") {
                socket.off("boss_tm_hp_update");
                socket.off("boss_tm_defeated");
            }

            showNotification(`⏹️ Socket listener Bí Cảnh đã tắt (bossId=${this.currentBossId})`, "warn");
        }
    }
// ===============================================
// HOANG VỰC
// ===============================================
 class HoangVuc {
            constructor() {
                this.ajaxUrl = `${weburl}wp-content/themes/halimmovies-child/hh3d-ajax.php`;
                this.adminAjaxUrl = `${weburl}wp-admin/admin-ajax.php`;
                this.logPrefix = "[HH3D Hoang Vực]";
                this.headers = {
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                    "X-Requested-With": "XMLHttpRequest",
                };
            }
            /**
            * Lấy nguyên tố của người dùng từ trang Hoang Vực.
            */
            async getMyElement() {
                const url = weburl + 'hoang-vuc?t';
                const response = await fetch(url);
                const text = await response.text();
                // const regex = /<img id="user-nguhanh-image".*?src=".*?ngu-hanh-(.*?)\.gif"/;
                const regex = /(?:class="user-element"[^>]*>.*?|id="user-nguhanh-image"[^>]*data-src=")[^"']*ngu-hanh-(moc|thuy|hoa|tho|kim)\.gif/i;
                const match = text.match(regex);
                if (match && match[1]) {
                    const element = match[1];
                    console.log(`${this.logPrefix} ✅ Đã lấy được nguyên tố của bạn: ${element}`);
                    return element;
                } else {
                    console.error(`${this.logPrefix} ❌ Không tìm thấy nguyên tố của người dùng.`);
                    return null;
                }
            }

            /**
            * Xác định nguyên tố tối ưu dựa trên boss và chiến lược.
            * @param {string} bossElement - Nguyên tố của boss.
            * @param {boolean} maximizeDamage - true: tối đa hóa sát thương; false: tránh giảm sát thương.
            * @returns {Array<string>} Mảng chứa các nguyên tố phù hợp.
            */
            getTargetElement(bossElement, maximizeDamage) {
                const rules = {
                    'kim': { khac: 'moc', bi_khac: 'hoa' },
                    'moc': { khac: 'tho', bi_khac: 'kim' },
                    'thuy': { khac: 'hoa', bi_khac: 'tho' },
                    'hoa': { khac: 'kim', bi_khac: 'thuy' },
                    'tho': { khac: 'thuy', bi_khac: 'moc' },
                };

                const suitableElements = [];

                if (maximizeDamage) {
                    // Tối đa hóa sát thương: tìm nguyên tố khắc boss
                    for (const myElement in rules) {
                        if (rules[myElement].khac === bossElement) {
                            suitableElements.push(myElement);
                            break; // Chỉ cần một nguyên tố khắc là đủ
                        }
                    }
                } else {
                    // Không bị giảm sát thương: tìm tất cả các nguyên tố không bị boss khắc
                    for (const myElement in rules) {
                        if (rules[myElement].bi_khac !== bossElement) {
                            suitableElements.push(myElement);
                        }
                    }
                }
                return suitableElements;
            }

            /**
            * Nhận thưởng Hoang Vuc.
            */
            async claimHoangVucRewards(nonce) {
                const payload = new URLSearchParams();
                payload.append('action', 'claim_chest');
                payload.append('nonce', nonce);

                console.log(`${this.logPrefix} 🎁 Đang nhận thưởng...`);
                const response = await fetch(this.adminAjaxUrl, {
                    method: 'POST',
                    headers: this.headers,
                    body: payload,
                    credentials: 'include'
                });
                const data = await response.json();
                if (data.success) {
                    const rewards = data.total_rewards;
                    const message = `✅ Nhận thưởng thành công: +${rewards.tinh_thach} Tinh Thạch, +${rewards.tu_vi} Tu Vi.`;
                    console.log(message);
                    showNotification(message, 'success');
                } else {
                    console.error(`${this.logPrefix} ❌ Lỗi khi nhận thưởng:`, data.message || 'Lỗi không xác định.');
                    showNotification(data.message || 'Lỗi khi nhận thưởng.', 'error');
                }
            }

            /**
            * Tấn công boss Hoang Vực.
            * @param {string} bossId - ID của boss cần tấn công.
            * @param {string} nonce - Nonce bảo mật.
            * @returns {Promise<boolean>} `True` nếu tấn công thành công, ngược lại là `false`.
            */
            async attackHoangVucBoss(bossId, nonce) {
                const currentTime = Date.now();
                const securityToken = await getSecurityToken(weburl + 'hoang-vuc?t');
                const payload = new URLSearchParams();
                payload.append('action', 'attack_boss');
                payload.append('boss_id', bossId);
                payload.append('security_token', securityToken);
                payload.append('nonce', nonce);
                payload.append('request_id', `req_${Math.random().toString(36).substring(2, 8)}${currentTime}`);

                console.log(`${this.logPrefix} ⚔️ Đang tấn công boss...`);
                const response = await fetch(this.ajaxUrl, {
                    method: 'POST',
                    headers: this.headers,
                    body: payload,
                    credentials: 'include'
                });
                const data = await response.json();
                if (data.success) {
                    const message = data.data.message || data.message || JSON.stringify(data) || 'Tấn công thành công!';
                    console.log(`${this.logPrefix} ✅ ${message}`);
                    showNotification(`✅ ${message}`, 'success');
                    return true
                } else if (data.data.error === 'Đạo hữu đã hết lượt tấn công trong ngày.') {
                    taskTracker.markTaskDone(accountId, 'hoangvuc');
                    showNotification('Đạo hữu đã hết lượt tấn công trong ngày.', 'info');
                    return true;
                }
                else {
                    const errorMessage = data.data.error || 'Lỗi không xác định khi tấn công.';
                    showNotification(errorMessage, 'error');
                    return false;
                }
            }

            /**
            * Lặp lại việc đổi nguyên tố cho đến khi đạt được nguyên tố phù hợp hoặc không thể đổi tiếp.
            * @param {string} currentElement - Nguyên tố hiện tại của người dùng.
            * @param {string} bossElement - Nguyên tố của boss.
            * @param {boolean} maximizeDamage - Chiến lược tối đa hóa sát thương hay không.
            * @param {string} nonce - Nonce bảo mật.
            * @returns {Promise<string|null>} Nguyên tố mới nếu đổi thành công, ngược lại là null.
            */
            async changeElementUntilSuitable(currentElement, bossElement, maximizeDamage, nonce) {
                let myElement = currentElement;
                let changeAttempts = 0;
                const MAX_ATTEMPTS = 5;

                const rules = {
                    'kim':  { khac: 'moc',  bi_khac: 'hoa' },
                    'moc':  { khac: 'tho',  bi_khac: 'kim' },
                    'thuy': { khac: 'hoa',  bi_khac: 'tho' },
                    'hoa':  { khac: 'kim',  bi_khac: 'thuy' },
                    'tho':  { khac: 'thuy', bi_khac: 'moc' },
                };

                function isOptimal(el) {
                    return rules[el].khac === bossElement;
                }
                function isNeutral(el) {
                    return rules[el].bi_khac !== bossElement;
                }

                while (changeAttempts < MAX_ATTEMPTS) {
                    changeAttempts++;

                    const currentlyOptimal = isOptimal(myElement);
                    const currentlyNeutral = isNeutral(myElement);

                    // 🔎 Kiểm tra trước khi đổi
                    if (!currentlyNeutral) {
                        console.log(`${this.logPrefix} ❌ Đang bị boss khắc chế -> phải đổi.`);
                    } else {
                        if (maximizeDamage && currentlyOptimal) {
                            console.log(`${this.logPrefix} 🌟 Đang ở trạng thái tối ưu. Dừng đổi.`);
                            return myElement;
                        }
                        if (!maximizeDamage && currentlyNeutral) {
                            console.log(`${this.logPrefix} ✅ Đang ở trạng thái hòa (không bị giảm). Dừng đổi.`);
                            return myElement;
                        }
                    }

                    // 🔄 Tiến hành đổi element
                    const payloadChange = new URLSearchParams({ action: 'change_user_element', nonce });
                    const changeData = await (await fetch(this.ajaxUrl, {
                        method: 'POST',
                        headers: this.headers,
                        body: payloadChange,
                        credentials: 'include'
                    })).json();

                    if (changeData.success) {
                        myElement = changeData.data.new_element;
                        console.log(`${this.logPrefix} 🔄 Đổi lần ${changeAttempts} -> ${myElement}`);
                        await new Promise(resolve => setTimeout(resolve, 500));
                    } else {
                        console.error(`${this.logPrefix} ❌ Lỗi khi đổi:`, changeData.message || 'Không xác định.');
                        return myElement;
                    }
                }

                // ⏳ Hết lượt đổi nhưng vẫn chưa đạt chiến lược
                console.log(`${this.logPrefix} ⚠️ Đã hết MAX_ATTEMPTS (${MAX_ATTEMPTS}). Chấp nhận nguyên tố cuối cùng: ${myElement}`);
                return myElement;
            };

            async getNonceAndRemainingAttacks(url) {
                const logPrefix = '[Hoang Vực]';
                    console.log(`${logPrefix} ▶️ Đang tải trang từ ${url}...`);
                    try {
                        const response = await fetch(url);
                        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                        const html = await response.text();

                        // Regex 1: lấy số lượt đánh
                        const attacksMatch = html.match(/<div class="remaining-attacks">Lượt đánh còn lại:\s*(\d+)<\/div>/);
                        const remainingAttacks = attacksMatch ? parseInt(attacksMatch[1], 10) : null;

                        // Regex 2: lấy nonce
                        const nonceMatch = html.match(/var ajax_boss_nonce = '([a-f0-9]+)'/);
                        const nonce = nonceMatch ? nonceMatch[1] : null;

                        console.log(`${logPrefix} ✅ Lấy dữ liệu thành công.`);
                        return { remainingAttacks, nonce };

                    } catch (e) {
                        console.error(`${logPrefix} ❌ Lỗi khi tải trang hoặc trích xuất dữ liệu:`, e);
                        return { remainingAttacks: null, nonce: null };
                    }
                }


            /**
            * Hàm chính để tự động hóa Hoang Vực.
            */
            async doHoangVuc() {
                const maximizeDamage = localStorage.getItem('hoangvucMaximizeDamage') === 'true';
                console.log(`${this.logPrefix} ▶️ Bắt đầu nhiệm vụ với chiến lược: ${maximizeDamage ? 'Tối đa hóa Sát thương' : 'Không giảm Sát thương'}.`);
                const hoangVucUrl = `${weburl}hoang-vuc?t`;
                const { remainingAttacks, nonce } = await this.getNonceAndRemainingAttacks(hoangVucUrl);

                if (!nonce) {
                    showNotification('Lỗi: Không thể lấy nonce cho Hoang Vực.', 'error');
                    throw new Error("Không lấy được nonce");
                }

                const payloadBossInfo = new URLSearchParams();
                payloadBossInfo.append('action', 'get_boss');
                payloadBossInfo.append('nonce', nonce);

                try {
                    const bossInfoResponse = await fetch(this.ajaxUrl, {
                        method: 'POST',
                        headers: this.headers,
                        body: payloadBossInfo,
                        credentials: 'include'
                    });
                    const bossInfoData = await bossInfoResponse.json();

                    if (bossInfoData.success) {
                        const boss = bossInfoData.data;

                        if (boss.has_pending_rewards) {
                            await this.claimHoangVucRewards(nonce);
                            return this.doHoangVuc();
                        } else if (boss.created_date === new Date().toISOString().slice(0, 10) && boss.health === boss.max_health) {
                            taskTracker.markTaskDone(accountId, 'hoangvuc');
                            return true;
                        }

                        let myElement = await this.getMyElement();
                        const bossElement = boss.element;

                        // Lấy danh sách các nguyên tố phù hợp
                        const suitableElements = this.getTargetElement(bossElement, maximizeDamage);

                        if (!suitableElements.includes(myElement)) {
                            console.log(`${this.logPrefix} 🔄 Nguyên tố hiện tại (${myElement}) không phù hợp. Đang thực hiện đổi.`);
                            const newElement = await this.changeElementUntilSuitable(myElement, bossElement, maximizeDamage, nonce);

                            if (newElement && suitableElements.includes(newElement)) {
                                myElement = newElement;
                                console.log(`${this.logPrefix} ✅ Đã có được nguyên tố phù hợp: ${myElement}.`);
                            } else {
                                console.log(`${this.logPrefix} ⚠️ Không thể có được nguyên tố phù hợp sau khi đổi. Tiếp tục với nguyên tố hiện tại.`);
                            }
                        } else {
                            console.log(`${this.logPrefix} ✅ Nguyên tố hiện tại (${myElement}) đã phù hợp. Không cần đổi.`);
                        }
                        // Cập nhật số lượt đánh còn lại
                        await new Promise(resolve => setTimeout(resolve, 500));
                        const timePayload = new URLSearchParams();
                        timePayload.append('action', 'get_next_attack_time');
                        const timeResponse = await fetch(this.ajaxUrl, {
                            method: 'POST',
                            headers: this.headers,
                            body: timePayload,
                            credentials: 'include'
                        });
                        const nextAttackTime = await timeResponse.json();

                        if (nextAttackTime.success && Date.now() >= nextAttackTime.data) {
                            // Thực hiện tấn công boss Hoang Vực, nếu thành công và còn 1 lượt tấn công thì đánh dấu nhiệm vụ hoàn thành
                            await new Promise(resolve => setTimeout(resolve, 500));
                            if (await this.attackHoangVucBoss(boss.id, nonce)){
                                taskTracker.adjustTaskTime(accountId, 'hoangvuc', timePlus('15:02'));   //--------- 15 phút cho lần sau -----------//
                                if (remainingAttacks <= 1) {
                                taskTracker.markTaskDone(accountId, 'hoangvuc');
                                };
                            };
                        } else {
                            const remainingTime = nextAttackTime.data - Date.now();
                            const remainingSeconds = Math.floor(remainingTime / 1000);
                            const minutes = Math.floor(remainingSeconds / 60);
                            const seconds = remainingSeconds % 60;
                            const message = `⏳ Cần chờ <b>${minutes} phút ${seconds} giây</b> để tấn công tiếp.`; ///////////////////
                            showNotification(message, 'info');
                            taskTracker.adjustTaskTime(accountId, 'hoangvuc', nextAttackTime.data);
                        }
                    } else {
                        const errorMessage = bossInfoData.message || 'Lỗi không xác định khi lấy thông tin boss.';
                        showNotification(errorMessage, 'error');
                    }
                } catch (e) {
                    console.error(`${this.logPrefix} ❌ Lỗi mạng:`, e);
                    showNotification(e.message, 'error');
                    throw e;
                }
            }
        }


        // ===============================================
        // HOANG VỰC SHOP
        // ===============================================


    class HoangVucShop {
        constructor() {
            this.ajaxUrl = `${weburl}wp-content/themes/halimmovies-child/hh3d-ajax.php`;
            this.logPrefix = "[HH3D Hoang Vuc Shop]";
            this.dailyLimit = 5;
        }

        async getHoangVucNonce() {
            const url = `${weburl}hoang-vuc?t`;
            try {
                const response = await fetch(url, { credentials: 'include' });
                if (!response.ok) return null;
                const html = await response.text();
                const nonceMatch = html.match(/var ajax_boss_nonce = '([a-f0-9]+)'/);
                return nonceMatch ? nonceMatch[1] : null;
            } catch (err) {
                console.error(`${this.logPrefix} ❌ Lỗi khi lấy nonce:`, err);
                return null;
            }
        }

        getTodayKey() {
            return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' });
        }

        resetPurchase() {
            const todayKey = this.getTodayKey();
            localStorage.setItem('hoangvuc-purchase', JSON.stringify({
                date: todayKey,
                count: 0,
                lastPurchaseTime: null
            }));
        }

        getPurchasedToday() {
            const saved = JSON.parse(localStorage.getItem('hoangvuc-purchase') || '{}');
            const todayKey = this.getTodayKey();

            if (!saved.date || saved.date !== todayKey) {
                this.resetPurchase();
                return 0;
            }
            return saved.count || 0;
        }

        setPurchasedToday(count) {
            const todayKey = this.getTodayKey();
            const now = new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' });
            localStorage.setItem('hoangvuc-purchase', JSON.stringify({
                date: todayKey,
                count,
                lastPurchaseTime: now
            }));
        }

        isDailyLimit() {
            return this.getPurchasedToday() >= this.dailyLimit;
        }

        async muaRuongLinhBao(quantity) {
            const nonce = await this.getHoangVucNonce();
            if (!nonce) {
                showNotification("❌ Không lấy được nonce, vui lòng đăng nhập lại", "error");
                return null;
            }

            let purchased = this.getPurchasedToday();
            if (purchased >= this.dailyLimit) {
                showNotification("⚠️ Bạn đã mua đủ 5 rương hôm nay", "warn");
                return null;
            }

            let allowedQuantity = quantity;
            if (purchased + quantity > this.dailyLimit) {
                allowedQuantity = this.dailyLimit - purchased;
                showNotification(`⚠️ Chỉ có thể mua thêm ${allowedQuantity} rương để đạt tối đa 5/ngày`, "warn");
            }

            try {
                const body = new URLSearchParams({
                    action: "purchase_item_shop_boss",
                    item_id: "ruong_linh_bao",
                    item_type: "tinh_thach",
                    quantity: allowedQuantity,
                    nonce: nonce
                });

                const response = await fetch(this.ajaxUrl, {
                    method: "POST",
                    body,
                    credentials: "include"
                });

                const res = await response.json();
                console.log(`${this.logPrefix} 📦 Response:`, res);

                if (res.success) {
                    purchased += allowedQuantity;
                    this.setPurchasedToday(purchased);
                    showNotification(`✅ ${res.data.message}`, "success");
                } else {
                    showNotification(`⚠️ ${res.data}`, "warn");
                }
                return res;
            } catch (err) {
                console.error(`${this.logPrefix} ❌ Lỗi khi mua rương:`, err);
                showNotification("❌ Lỗi khi gửi yêu cầu mua rương", "error");
                return null;
            }
        }
    }

        // ===============================================
        // ĐAN TÔNG
        // ===============================================


    class DanTongShop {
    constructor() {
        this.weburl = weburl;
        this.apiUrl = this.weburl + "wp-json/tong-mon/v1/buy-dan-duoc-tm";
        this.logPrefix = "[HH3D Đan Tông Môn]";
        this.danList = [];
        const DanTongfileName = "/DanTongMon.json";
        this.DanTongUrl = baseUrl + repoPath + branch + DanTongfileName;
    }

    async loadDanTongList() {
        if (this.danList && this.danList.length > 0) return;
        try {
            const response = await fetch(this.DanTongUrl);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            this.danList = await response.json(); // [{ id, name }, ...]
        } catch (err) {
            console.error(`${this.logPrefix} ❌ Lỗi khi tải danh sách Đan Tông:`, err);
            throw err;
        }
    }

    async muaDanTong(itemId, nonce) {
        try {
            const headers = {
                "Content-Type": "application/json",
                "X-WP-Nonce": nonce
            };
            const bodyPayload = { item_id: itemId };

            const response = await fetch(this.apiUrl, {
                method: "POST",
                headers,
                credentials: "include",
                referrer: this.weburl + "danh-sach-thanh-vien-tong-mon",
                body: JSON.stringify(bodyPayload),
                mode: "cors"
            });

            const res = await response.json();
            console.log(`${this.logPrefix} 📦 Mua ${itemId}:`, res);
            return res;
        } catch (err) {
            console.error(`${this.logPrefix} ❌ Lỗi khi mua ${itemId}:`, err);
            return null;
        }
    }

    async muaTopNDanTong(n) {
        await this.loadDanTongList();
        const nonce = await getNonce(); // lấy nonce một lần cho cả vòng lặp
        const topN = this.danList.slice(0, n);

        for (const item of topN) {
            let keepBuying = true;
            while (keepBuying) {
                const res = await this.muaDanTong(item.id, nonce);
                if (!res) break;
                if (res.success) {
                    showNotification(`✅ Mua thành công ${item.name}`, "success");
                } else {
                    showNotification(`⚠️ ${item.name}: ${res.message}`, "warn");
                    keepBuying = false;
                }
            }
        }
        // showNotification(`🎉 Hoàn thành mua ${n} loại đan to nhất`, "success");
    }
}



    // ===============================================
        // ĐAN TỤ BẢO CÁC
        // ===============================================

class DanTuBaoShop {
    constructor() {
        this.weburl = weburl;
        this.logPrefix = "[HH3D Đan Tụ Bảo Các]";
        this.nonceLogged = false;
        this.danDuocList = [];

        const DanTuBaofileName = "/DanTuBaoCac.json";
        this.DanTuBaoUrl = baseUrl + repoPath + branch + DanTuBaofileName;

    }

    async loadDanDuocList() {
        if (this.danDuocList && this.danDuocList.length > 0) return;
        try {
            const response = await fetch(this.DanTuBaoUrl);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            this.danDuocList = await response.json();
            showNotification(`✅ Đã tải danh sách đan (${this.danDuocList.length} items)`, "info");
        } catch (err) {
            showNotification("❌ Lỗi khi tải danh sách đan", "error");
            throw err;
        }
    }

    // 🔑 lấy Nonce từ fetch HTML từ trang Tụ Bảo Các
    async getNonceAndUrl() {
        try {
            const response = await fetch(this.weburl + "tu-bao-cac?t", { credentials: "include" });
            const html = await response.text();

            const regex = /var\s+Ajax_Shop\s*=\s*(\{.*?\});/s;
            const match = html.match(regex);

            if (match && match[1]) {
                const ajaxShop = JSON.parse(match[1]);
                if (!this.nonceLogged) {
                    //showNotification(`🔐 Nonce lấy được: ${ajaxShop.nonce}`, "info");
                    console.log("🔑 Nonce tụ bảo:", ajaxShop.nonce);
                    this.nonceLogged = true;
                }
                return ajaxShop;
            }
            showNotification("❌ Không tìm thấy Ajax_Shop trong HTML", "error");
            return { nonce: null, ajaxurl: this.weburl + "wp-admin/admin-ajax.php" };
        } catch (e) {
            showNotification("❌ Lỗi khi tải trang Tụ Bảo Các để lấy nonce", "error");
            return { nonce: null, ajaxurl: this.weburl + "wp-admin/admin-ajax.php" };
        }
    }

    async getSelfTuVi() {
        const els = document.querySelectorAll('#head_manage_acc');
        for (const el of els) {
            const text = el.textContent || "";
            if (text.includes("Tu Vi")) {
                const num = text.match(/\d+/);
                if (num) return parseInt(num[0], 10);
            }
        }
        return null;
    }

    async muaDanTuBao(dan, nonce, apiUrl) {
        try {
            const bodyPayload = new URLSearchParams({
                action: "handle_buy_danduoc",
                danduoc_id: dan.id,
                nonce: nonce
            });

            const response = await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
                credentials: "include",
                body: bodyPayload.toString()
            });

            const res = await response.json();
            const serverMsg = res?.data?.message || res?.message || "Lỗi không xác định";

            if (res.success) {
                showNotification(`✅ ${dan.name} — ${serverMsg}`, "success");
            } else {
                showNotification(`⚠️ Bỏ qua ${dan.name} — ${serverMsg}`, "warn");
            }
            return res;
        } catch (err) {
            showNotification(`⚠️ Bỏ qua ${dan.name} — ${err.message}`, "warn");
            return { success: false, data: { message: err.message } };
        }
    }

    async autobuyTuBao() {
        let myTuVi = await this.getSelfTuVi();
        if (!myTuVi) {
            showNotification("❌ Không lấy được Tu Vi", "error");
            return;
        }

        await this.loadDanDuocList();
        const ajaxShop = await this.getNonceAndUrl();
        if (!ajaxShop.nonce) {
            showNotification("❌ Không tìm thấy Nonce, cần truy cập Tụ Bảo Các để mua đan", "error");
            return;
        }

        let totalTuViGain = 0;
        let totalCost = 0;
        const skippedItems = new Set();

        const parseRange = (rangeStr) => {
            const [minStr, maxStr] = (rangeStr || "").split("-");
            return { min: parseInt(minStr, 10), max: parseInt(maxStr, 10) };
        };

        const idNumeric = (id) => {
            const m = /^item_(\d+)$/.exec(id || "");
            return m ? parseInt(m[1], 10) : NaN;
        };

        let keepGoing = true;
        while (keepGoing) {
            const danhSachPhuHop = this.danDuocList
                .map(d => ({ ...d, ...parseRange(d.range) }))
                .filter(d => myTuVi >= d.min && myTuVi <= d.max && !skippedItems.has(d.id));

            if (danhSachPhuHop.length === 0) {
                showNotification(`⚠️ Tu Vi ${myTuVi} không phù hợp với đan nào`, "warn");
                break;
            }

            danhSachPhuHop.sort((a, b) => {
                if (a.max !== b.max) return a.max - b.max;
                const na = idNumeric(a.id), nb = idNumeric(b.id);
                if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
                return String(a.id).localeCompare(String(b.id));
            });

            let muaThanhCong = false;
            for (const dan of danhSachPhuHop) {
                showNotification(`📌 Tu Vi ${myTuVi} thử mua ${dan.name}`, "info");
                const res = await this.muaDanTuBao(dan, ajaxShop.nonce, ajaxShop.ajaxurl);

                if (res?.success) {
                    totalTuViGain += dan.tuviGain;
                    totalCost += dan.cost;
                    myTuVi += dan.tuviGain;
                    muaThanhCong = true;
                    break;
                } else {
                    skippedItems.add(dan.id);
                }
            }

            if (!muaThanhCong) {
                showNotification(`❌ Không thể mua thêm viên nào ở Tu Vi ${myTuVi}`, "error");
                keepGoing = false;
            }
        }

        showNotification(`📊 Tổng kết: +${totalTuViGain} Tu Vi, -${totalCost} Tinh Thạch`, "info");
    }
}
//================== Pháp Tướng/ kHẮC TRẬN VĂN=====================//

class KhacTranVan {
    constructor() {
        this.weburl = weburl;
        this.logPrefix = "[HH3D Khắc Trận Văn]";
        this.config = null;
    }

    // 🔑 Lấy nonce và token từ trang Pháp Tướng
    async getConfig() {
        try {
            const response = await fetch(this.weburl + "/trieu-hoi-phap-tuong?t", {
                headers: {
                    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
                    "sec-fetch-dest": "iframe",
                    "sec-fetch-mode": "navigate",
                    "sec-fetch-site": "same-origin",
                    "referer": this.weburl + "/tu-bao-cac?t"+ Math.random().toString(36).substring(2, 8)
                } ,
                credentials: "include"
            });
            const html = await response.text();

            // Regex tìm đoạn PHAP_TUONG_CONFIG = {...};
            const regex = /PHAP_TUONG_CONFIG\s*=\s*(\{[\s\S]*?\});/;
            const match = html.match(regex);

            if (match && match[1]) {
                // Không dùng JSON.parse vì đây là object JS, không phải JSON
                this.config = eval("(" + match[1] + ")");
                console.log(this.logPrefix, "🔑 Nonce:", this.config.nonce);
                console.log(this.logPrefix, "🔒 Token:", this.config.token);
                return this.config;
            } else {
                showNotification("❌ Không tìm thấy PHAP_TUONG_CONFIG trong HTML", "error");
                return null;
            }
        } catch (e) {
            console.error(this.logPrefix, e);
            showNotification("❌ Lỗi khi tải trang Pháp Tướng để lấy nonce/token", "error");
            return null;
        }
    }

    // 🌟 Claim lượt VIP
   async claimDailyTurns(accountId) {
    if (!this.config) await this.getConfig();
    if (!this.config?.nonce || !this.config?.token) return false; // ❌ thiếu config thì coi như thất bại

    try {
        const response = await fetch(this.weburl + "wp-json/phap-tuong/v1/claim-daily-turns", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-WP-Nonce": this.config.nonce,
                "X-Pt-Token": this.config.token
            },
            referrer: this.weburl + "/tu-bao-cac?t",
        });

        const data = await response.json();

        // ✅ Thành công
        if (data.success) {
            showNotification(`${this.logPrefix}✨ ${data.message}`, "success");
            console.log(this.logPrefix, `🎁 Nhận thêm ${data.turns_claimed} lượt`);
            this.config.remainingTurns = data.new_total;
         taskTracker.markTaskDone(accountId, 'luotkhactranvip');
            return true;

        }

        // ✅ Đã nhận rồi (coi như OK)
        if (data.message && data.message.includes("Đạo hữu đã nhận lượt VIP hôm nay rồi")) {
            showNotification(`${this.logPrefix}ℹ️ ${data.message}`, "info");
            //console.log(this.logPrefix, data.message);
            taskTracker.markTaskDone(accountId, 'luotkhactranvip');
            return true;

        }

        // ✅ Tính năng dành riêng cho VIP (coi như OK)
        if (data.message && data.message.includes("Tính năng dành riêng cho VIP")) {
            showNotification(`${this.logPrefix}🔒 ${data.message}`, "error");
            //console.log(this.logPrefix, data.message);
            //console.log(this.logPrefix, "test nè");
            taskTracker.markTaskDone(accountId, 'luotkhactranvip');
            return true;

        }

        // ❌ Các lỗi khác
        showNotification(`${this.logPrefix}ℹ️ ${data.message}`, "error");

        return false;

    } catch (err) {
        console.error(this.logPrefix, "❌ Lỗi khi claim lượt VIP:", err);
        return null;
    }
}

    // 📜 Thực hiện một lần khắc trận văn
    async activateSeal() {
        if (!this.config) await this.getConfig();
        if (!this.config?.nonce || !this.config?.token) return null;

        try {
            const response = await fetch(this.weburl + "/wp-json/phap-tuong/v1/activate-seal", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    "X-WP-Nonce": this.config.nonce,
                    "x-pt-token": this.config.token
                }
            });
            return await response.json(); // chỉ trả về data
        } catch (err) {
            console.error(this.logPrefix, "❌ Lỗi khi khắc trận văn:", err);
            return null;
        }
    }

    // ✅ Hàm kiểm tra còn lượt khắc hay không (luôn claim trước rồi mới check)
    async checkRemainingTurns() {
        await this.getConfig();

        // luôn thử claim trước
        //await this.claimDailyTurns();

        const turns = this.config?.remainingTurns || 0;
        return turns <= 0; // true nếu hết lượt, false nếu còn
    }

    // 🔄 Hàm tự động khắc theo số lượt còn lại
    async autoActivateSeal() {
        const isOut = await this.checkRemainingTurns();
        if (isOut) {
            showNotification("❌ Không còn lượt khắc trận văn", "error");
            console.log(this.logPrefix, "❌ Không còn lượt khắc trận văn");
            return;
        }

        // lấy số lượt từ config đã refresh trong checkRemainingTurns
        let turns = this.config?.remainingTurns || 0;
        console.log(this.logPrefix, `🔍 Bắt đầu, còn ${turns} lượt.`);

        let successCount = 0;
        let failCount = 0;

        while (turns > 0) {
            const res = await this.activateSeal();
            if (!res) {
                showNotification("❌ Lỗi khi khắc trận văn", "error");
                break;
            }

            if (res.success) {
                successCount++;
                showNotification(`✅ Thành công: ${res.message}`, "success");
            } else {
                failCount++;
                showNotification(`⚠️ Thất bại: ${res.message}`, "warn");
            }

            turns = res.remaining_turns ?? turns - 1;
            await new Promise(r => setTimeout(r, 1000));
        }

        if (turns <= 0) {
            showNotification(
                `⏹ Hết lượt khắc trận văn. Tổng kết: ${successCount} thành công, ${failCount} thất bại.`,
                "info"
            );
        } else {
            showNotification(
                `⏹ Dừng sớm, còn ${turns} lượt chưa dùng.`,
                "warn"
            );
        }
    }
}


  // ===============================================
        // LUẬN VÕ
        // ===============================================

    class LuanVo {
        constructor() {
        this.weburl = weburl;
        this.accountId = accountId;
        this.logPrefix = '[Luận Võ]';
        this.config = null;
        this.currentTarget = null;
        this.targetLeft = 0;
        this.sent = 0;
        this.maxBattles = 5;
    }

    async setupConfig() {
        const nonce = await getNonce();
        const securityToken = await getSecurityToken(this.weburl + 'luan-vo-duong?t');
        this.config = { nonce, token: securityToken };
    }

    async sendApiRequest(endpoint, method, body = {}) {
        try {
            const url = `${this.weburl}${endpoint}`;
            const headers = {
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest",
                "X-WP-Nonce": this.config.nonce,
                "x-lv-token": this.config.token
            };

            const response = await fetch(url, {
                method,
                headers,
                body: JSON.stringify(body),
                credentials: 'include'
            });

            const contentType = response.headers.get("content-type");
            let data = null;
            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
            } else {
                data = await response.text();
            }
            if (!response.ok) {
                console.warn(`${this.logPrefix} ⚠️ API lỗi ${response.status}:`, data);
                return data;
            }
            return data;
        } catch (error) {
            console.error(`${this.logPrefix} ❌ Lỗi khi gửi yêu cầu tới ${endpoint}:`, error);
            return null;
        }
    }
    /**
    * Hàm hỗ trợ: Đợi một khoảng thời gian.
    */
    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


    /**
    *
    lấy thông tin lượt gửi/nhận
    */
async fetchLvPageInfo() {
  try {
    const url = "/luan-vo-duong?t=" + Date.now();
    const resp = await fetch(url, {
      credentials: "include",
      cache: "no-store"
    });
    if (!resp.ok) {
      throw new Error("Không load được trang Luận Võ");
    }

    const html = await resp.text();
    const doc = new DOMParser().parseFromString(html, "text/html");

    // ===== PARSE ĐÃ GỬI / ĐÃ NHẬN =====
    let sent = 0;
    let received = 0;

    doc.querySelectorAll("p").forEach(p => {
      const t = p.innerText || "";
      if (t.includes("Đã gửi")) {
        const m = t.match(/(\d+)\s*\/\s*5/);
        if (m) {
          sent = Number(m[1]);
        }
      }
      if (t.includes("Đã nhận")) {
        const m = t.match(/(\d+)\s*\/\s*5/);
        if (m) {
          received = Number(m[1]);
        }
      }
    });


this.sent = sent;
this.received = received;
console.log(`${this.logPrefix} 🎯Đã gửi: ${this.sent}, Đã nhận: ${this.received}`);

    return { sent, received };
  } catch (error) {
    console.error("❌ Lỗi khi lấy thông tin Luận Võ:", error);
    return { sent: 0, received: 0 };
  }
}



    /**
    * Đảm bảo tính năng tự động chấp nhận khiêu chiến được bật.
    */
async ensureAutoAccept() {
    const toggleEndpoint = 'wp-json/luan-vo/v1/toggle-auto-accept';
    const result = await this.sendApiRequest(toggleEndpoint, 'POST', {});
    //console.log(`Check Status Auto Accept: ${result.message}`);



    if (result && result.success && result.message.includes('Đã bật')) {
        taskTracker.updateTask(this.accountId, 'luanvo', 'auto_accept', true);
        return true;
    }
        await this.sendApiRequest(toggleEndpoint, 'POST', {}); //bật lại nếu có manual tắt autoaccept
        //console.log("Đã bật lại tự động chấp nhận");
        taskTracker.updateTask(this.accountId, 'luanvo', 'auto_accept', true);
    return false;

}

        /**
    * Lấy danh sách tất cả user đang theo dõi
    * Gồm các phần: id, name, avatar, points, auto_accept, can_receive_count, profile_link, role, role_color, description, challenges_remaining, challenge_exists, challenge_id, is_following, is_joined_today, can_send_count, max_batch_count
    */

async getFollowingUsers() {
    console.log(`${this.logPrefix} 🕵️ Đang lấy danh sách người theo dõi...`);
    const endpoint = 'wp-json/luan-vo/v1/get-following-users';
    const body = { page: 1 };
    const data = await this.sendApiRequest(endpoint, 'POST', body);

    if (data && data.success) {
        const users = data.data.users;
        console.log(`${this.logPrefix} ✅ Tìm thấy ${users.length} người dùng.`);
        return users;
    } else {
        console.error(`${this.logPrefix} ❌ Lỗi khi lấy Online Users: ${data?.message || data?.data}`);
        return [];
    }
}


async getOnlineUsers() {
    console.log("🟢 Đang lấy danh sách người dùng online...");
    const endpoint = 'wp-json/luan-vo/v1/online-users';
    const body = { page: 1 };
    const data = await this.sendApiRequest(endpoint, 'POST', body);

    if (data && data.success) {
        const users = data.data.users;
        console.log(`✅ Tìm thấy ${users.length} người online.`);
        return users;
    } else {
       console.error(`${this.logPrefix} ❌ Lỗi khi lấy Online Users: ${data?.message || data?.data}`);
        return [];
    }
}



    async sendChallenge(userId, nonce, token) {
            console.log(`${this.logPrefix} 🎯 Đang gửi khiêu chiến đến người chơi ID: ${userId}...`);
            const challengeMode = localStorage.getItem('luanVoChallengeMode') || 'auto';

            const sendEndpoint = 'wp-json/luan-vo/v1/send-challenge';
            const sendBody = { target_user_id: userId };
            const sendResult = await this.sendApiRequest(sendEndpoint, 'POST', nonce, token, sendBody);

            if (sendResult && sendResult.success) {
                console.log(`${this.logPrefix} 🎉 Gửi khiêu chiến thành công! Challenge ID: ${sendResult.data.challenge_id}`);

                // Bước mới: Kiểm tra nếu đối thủ bật auto_accept
                if (sendResult.data.auto_accept || challengeMode === 'manual') {
                    console.log(`${this.logPrefix} ✨ Đối thủ tự động chấp nhận, đang hoàn tất trận đấu...`);

                    const approveEndpoint = 'wp-json/luan-vo/v1/auto-approve-challenge';
                    const approveBody = {
                        challenge_id: sendResult.data.challenge_id,
                        target_user_id: userId
                    };

                    const approveResult = await this.sendApiRequest(approveEndpoint, 'POST', nonce, token, approveBody);

                    if (approveResult && approveResult.success) {
                        showNotification(`[Luận võ] ${approveResult.data.message}!`, 'success');
                        return true;
                    } else {
                        const message = approveResult?.data?.message || 'Lỗi không xác định khi hoàn tất trận đấu.';
                        showNotification(`❌ Lỗi hoàn tất trận đấu: ${message}`, 'error');
                        return false;
                    }
                } else {
                    showNotification(`✅ Đã gửi khiêu chiến đến ${userId}! Đang chờ đối thủ chấp nhận.`, 'success');
                    return true;
                }
            } else {
                const message = sendResult?.data?.message || JSON.stringify(sendResult) || 'Lỗi không xác định.';
                showNotification(`❌ Gửi khiêu chiến thất bại: ${message}`, 'error');
                return false;
            }
        }

async attackCurrentTarget() {
    if (!this.currentTarget) return;

    // ✅ nếu mình đã đủ 5 lượt → STOP
    if (this.sent >= this.maxBattles) {
        console.log("🏁 Đã đủ 5 lượt đấm — dừng auto", "success");
        return;
    }

    // ❌ target hết lượt
    if (this.targetLeft <= 0) {
        showNotification("🔄 Target hết lượt — chuyển đối tượng", "warn");
        this.currentTarget = null;
        return this.huntFromOnline();
    }
    const nonce = this.config.nonce;   
    const token = this.config.token;
    const success = await this.sendChallenge(this.currentTarget.id, nonce, token);
    if (success) {
        this.sent++;        // tăng số lượt mình đã gửi
        this.targetLeft--;  // giảm số lượt còn lại của target
        await this.delay(4400);
    }
    return this.attackCurrentTarget();
}


async huntLuanVoTargets() {
    // Kiểm tra chế độ
    const challengeMode = localStorage.getItem('luanVoChallengeMode') || 'auto';
    
    if (challengeMode === 'manual') {
        // Chế độ Theo ID
        const targetUserId = localStorage.getItem(`luanVoTargetUserId_${this.accountId}`) || '';
        if (!targetUserId) {
            showNotification("❌ Chưa cấu hình ID người chơi!", "error");
            return;
        }
        
        return this.huntSpecificUser(targetUserId);
    }
    
    // Chế độ Tự động (giữ logic cũ)
    const users = await this.getFollowingUsers();
    if (!Array.isArray(users) || users.length === 0) {
        showNotification("❌ Không lấy được danh sách follow", "error");
        return this.huntFromOnline();
    }

    const target = users.find(u => Number(u.can_receive_count) > 0);
    if (!target) {
        showNotification("⚠️ Follow full — chuyển ONLINE", "warn");
        return this.huntFromOnline();
    }

    this.currentTarget = target;
    const myRemaining = this.maxBattles - this.sent;
    this.targetLeft = Math.min(target.can_receive_count, myRemaining);

    console.log(`🎯 Chọn ${target.name} còn(${this.targetLeft} lượt)`);
    return this.attackCurrentTarget();
}

async huntSpecificUser(userId) {
    console.log(`🎯 Đang đánh theo ID: ${userId}`);
    
    // Đặt target với ID đã nhập
    this.currentTarget = {
        id: userId,
        user_id: userId,
        name: `User ${userId}`
    };
    
    // Gửi tất cả 5 lượt cho user này
    while (this.sent < this.maxBattles) {
        console.log(`${this.logPrefix} ⚔️ Gửi lượt ${this.sent + 1}/${this.maxBattles} cho ID: ${userId}`);
        
        const nonce = this.config.nonce;
        const token = this.config.token;
        const success = await this.sendChallenge(userId, nonce, token);
        if (success) {
            this.sent++;
            await this.delay(1000);
        } else {
            // Nếu thất bại, thử lại sau 2 giây
            console.warn(`${this.logPrefix} ⚠️ Gửi thất bại, thử lại sau 2s...`);
            await this.delay(2000);
        }
    }
    
    console.log(`${this.logPrefix} ✅ Hoàn thành ${this.sent} lượt cho ID: ${userId}`);
}


async huntFromOnline() {
    const users = await this.getOnlineUsers();
    if (!Array.isArray(users) || users.length === 0) {
        showNotification("😴 Online full — nghỉ 60s", "info");
        return setTimeout(() => this.huntLuanVoTargets(), 60000);
    }

    const target = users.find(u => Number(u.challenges_remaining) > 0);
    if (!target) {
        showNotification("⚠️ Không có online khả dụng", "warn");
        return;

    }

    this.currentTarget = target;
    const myRemaining = this.maxBattles - this.sent;
    this.targetLeft = Math.min(target.challenges_remaining, myRemaining);
    //showNotification(`⚔️ Online: ${target.name} còn(${this.targetLeft} lượt)`, "info");
    return this.attackCurrentTarget();
}



async receiveReward() {
    console.log(`${this.logPrefix} 🎁 Đang gửi yêu cầu nhận thưởng...`);

    const endpoint = 'wp-json/luan-vo/v1/receive-reward';
    const body = {};

    try {
        const response = await this.sendApiRequest(endpoint, 'POST', {});
        if (!response) {
            return;
        }
        if (response.success === true) {
            showNotification(`🎉 Luận võ: ${response.message}`, 'success');
            taskTracker.markTaskDone(accountId, 'luanvo');
            return;
        } else if (response.message === "Đạo hữu đã nhận thưởng trong ngày hôm nay.") {
            showNotification('🎁 Bạn đã nhận thưởng Luận Võ hôm nay rồi!', 'info')
            taskTracker.markTaskDone(accountId, 'luanvo');
            return;
        } else {

            // const errorMessage = response.message || 'Lỗi không xác định khi nhận thưởng.';
            //console.error(`${this.logPrefix} ❌ Lỗi khi nhận thưởng: ${response?.message || response?.data}`);
            showNotification(`❌ ${response?.message || response?.data}`, 'error');

        }
    } catch (error) {
        showNotification(`❌ Lỗi mạng khi gửi yêu cầu nhận thưởng. ${error}`, 'error');
    }
}


async startLuanVo() {
        if (!this.config) {
            await this.setupConfig();
        }

        // lấy số lượt đã gửi/nhận từ server
        await this.fetchLvPageInfo();

        // Bước 2: Tham gia trận đấu
                if (!taskTracker.getTaskStatus(accountId, 'luanvo').battle_joined) {
                    const joinResult = await this.sendApiRequest(
                        'wp-json/luan-vo/v1/join-battle', 'POST', {action: 'join_battle', security_token: this.config.token}
                    );
                    console.log(`Check tham gia trận đấu ${joinResult}`);

                    if (joinResult && joinResult.success === true) {
                        console.log(`✅ ${joinResult.message || 'Tham gia luận võ thành công.'}`);
                        taskTracker.updateTask(accountId, 'luanvo', 'battle_joined', true);
                    } else if (joinResult.message === 'Bạn đã tham gia Luận Võ Đường hôm nay rồi!') {
                        console.log(`ℹ️ ${joinResult.message}`);
                        taskTracker.updateTask(accountId, 'luanvo', 'battle_joined', true);
                    } else {
                        console.error(`${this.logPrefix} ❌ ${joinResult?.message}`);
                        showNotification(joinResult?.message, 'error');
                    }
                } else {

                    console.log(`${this.logPrefix} ℹ️ Đã tham gia luận võ trước đó`);
                }

                // Bước 3: Đảm bảo tự động chấp nhận khiêu chiến
                // if (!taskTracker.getTaskStatus(accountId, 'luanvo').auto_accept) {
                    const autoAcceptSuccess = await this.ensureAutoAccept();
                    console.log(`${autoAcceptSuccess}`);
                    if (autoAcceptSuccess) {
                        console.log(`${this.logPrefix} ✅ Tự động chấp nhận đã được bật.`);
                    } else {
                        console.log('⚠️ Đã bật tự động chấp nhận trước đó hoặc Đã bật lại tự động lần nữa');
                    }

                // }

    }


    async doLuanVo(autoChallenge = true) {
        await this.startLuanVo();
        // if (!autoChallenge) {
        //     return this.goToLuanVoPage();
        // }
        console.log("🔍 Bắt đầu auto Luận Võ...");
        await this.huntLuanVoTargets();
        await this.receiveReward();
    }


    /**Thuê Tiêu Viêm để hoàn thành khiêu chiến */
    async thueTieuViem(securityToken) {
        const nonce = await getNonce();
        if (!nonce) {
            showNotification('❌ Lỗi: Không thể lấy nonce cho Luận Võ.', 'error');
            return;
        }

        try {
            while (true) {
                const res = await fetch(weburl + "wp-json/luan-vo/v1/send-bot-challenge", {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        "X-WP-Nonce": nonce,
                        "X-LV-Token": securityToken
                    },
                    body: JSON.stringify({ bot_id: -1 })
                });

                if (!res.ok) {
                    console.error("❌ Request thất bại:", res.status);
                    break;
                }

                const data = await res.json();
                if (data.success) {
                    showNotification(data.message, 'success');
                } else if (data.message === "Đạo hữu đã đạt tối đa nhận khiêu chiến trong ngày.") {
                    showNotification('[Luận võ] Hoàn thành khiêu chiến Viêm Trẩu', 'info');
                    break;
                }
                // chờ 1-2 giây để tránh spam quá nhanh
                await new Promise(r => setTimeout(r, 1500));
            }
        } catch (error) {
            console.error("❌ Lỗi:", error);
        }
    }


    goToLuanVoPage() {
        const luanVoUrl = `${this.weburl}/luan-vo-duong?t`;
        if (confirm("Bạn có muốn chuyển đến trang Luận Võ Đường không?")) {
            window.location.href = luanVoUrl;
        }
    }
}
/// ====================================================
function extractActionTokens(html) {
  const map = {};
  
  // ⭐ BƯỚC 1: Tìm tất cả các object có chứa 'action:' (bất kể giá trị)
  const actionPosRegex = /['"]?action['"]?\s*[:=]/gi;
  let m;
  
  while ((m = actionPosRegex.exec(html)) !== null) {
    const actionIdx = m.index;
    
    // Tìm vị trí '{' gần nhất trước action
    let openPos = -1;
    for (let i = actionIdx; i >= 0 && i > actionIdx - 1000; i--) {
      if (html[i] === '{') { openPos = i; break; }
      if (html[i] === ';') break;
    }
    
    if (openPos === -1) continue;
    
    // Parse toàn bộ object từ '{' đến '}'
    let i = openPos;
    let depth = 0;
    let inStr = null;
    let escaped = false;
    let inLineComment = false;
    let inBlockComment = false;
    
    for (; i < html.length; i++) {
      const ch = html[i];
      if (inLineComment) {
        if (ch === '\n') inLineComment = false;
        continue;
      }
      if (inBlockComment) {
        if (ch === '*' && html[i+1] === '/') { inBlockComment = false; i++; continue; }
        continue;
      }
      if (inStr) {
        if (escaped) { escaped = false; continue; }
        if (ch === '\\') { escaped = true; continue; }
        if (ch === inStr) { inStr = null; continue; }
        continue;
      }
      if (ch === '"' || ch === "'" || ch === '`') { inStr = ch; continue; }
      if (ch === '/' && html[i+1] === '/') { inLineComment = true; i++; continue; }
      if (ch === '/' && html[i+1] === '*') { inBlockComment = true; i++; continue; }
      if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth === 0) { i++; break; }
      }
    }
    
    const objSlice = html.slice(openPos, i);
    
    // ⭐ BƯỚC 2: Extract security từ object (bất kể vị trí)
    const securityMatch = /['"]?security['"]?\s*[:=]\s*['"]([^'"]+)['"]/i.exec(objSlice);
    if (!securityMatch) continue; // Không có security trong object này
    
    const securityToken = securityMatch[1];
    
    // ⭐ BƯỚC 3: Extract action names (cả static, dynamic và ternary)
    const actionNames = new Set(); // Dùng Set để tránh trùng lặp
    
    // 3.1: Tìm action line trong object
    const actionLineMatch = /['"]?action['"]?\s*[:=]\s*([^,}]+)/i.exec(objSlice);
    if (actionLineMatch) {
      const actionValue = actionLineMatch[1].trim();
      
      // 3.1a: Static string: action: "enter_mine" hoặc action: 'enter_mine'
      const staticMatch = /^['"]([^'"]+)['"]/.exec(actionValue);
      if (staticMatch) {
        actionNames.add(staticMatch[1]);
      }
      
      // 3.1b: Dynamic hh3dData.act.xxx
      const dynamicMatches = actionValue.matchAll(/hh3dData\.act\.([a-zA-Z0-9_]+)/gi);
      for (const dm of dynamicMatches) {
        actionNames.add(dm[1]); // kmBuy, kmEnter, kmReward, etc.
      }
      
      // 3.1c: Ternary fallback: ... ? xxx : 'fallback_string'
      const ternaryMatch = /:\s*['"]([^'"]+)['"]/.exec(actionValue);
      if (ternaryMatch) {
        actionNames.add(ternaryMatch[1]); // buy_item_khoang, enter_mine, etc.
      }
    }
    
    // ⭐ BƯỚC 4: Map tất cả action names với security token
    for (const actionName of actionNames) {
      if (actionName && actionName.trim()) {
        const trimmedName = actionName.trim();
        // Chỉ map nếu chưa có hoặc update với token mới hơn
        if (!map[trimmedName] || map[trimmedName] !== securityToken) {
          map[trimmedName] = securityToken;
        }
      }
    }
  }
  
  // ⭐ BƯỚC 5: Tìm các action đơn lẻ không nằm trong object (legacy support)
  const legacyActionRegex = /['"]?action['"]?\s*[:=]\s*['"]([^'"]+)['"]/gi;
  let lm;
  while ((lm = legacyActionRegex.exec(html)) !== null) {
    const actionName = lm[1];
    if (map[actionName]) continue; // Đã có rồi, skip
    
    // Tìm security gần đó
    const slice = html.slice(lm.index, lm.index + 1000);
    const nm = /(?:['"]?(?:security|nonce)['"]?\s*[:=]\s*['"]([^'"]+)['"])/i.exec(slice);
    if (nm) map[actionName] = nm[1];
  }
  
  // ⭐ BƯỚC 6: Thêm các nguồn khác (input hidden, meta, biến global)
  let mm;
  const inputRegex = /<input[^>]+name=["'](?:security|nonce|_wpnonce)["'][^>]*value=["']([^"']+)["']/gi;
  while ((mm = inputRegex.exec(html)) !== null) map._global = map._global || mm[1];

  const meta = /<meta[^>]+name=["'](?:wpnonce|security|nonce)["'][^>]*content=["']([^"']+)["']/i.exec(html);
  if (meta) map._meta = map._meta || meta[1];

  const varRegex = /(?:var|let|const)\s+([a-zA-Z0-9_$]*nonce[a-zA-Z0-9_$]*)\s*=\s*['"]([^'"]+)['"]/gi;
  while ((mm = varRegex.exec(html)) !== null) map[mm[1]] = mm[2];

  // ⭐ BƯỚC 7: Xử lý đặc biệt cho "nonce" và "restNonce"
  // Nếu action name là "nonce" hoặc "restNonce", lấy giá trị từ JSON pattern
  if (!map['nonce']) {
    const nonceMatch = html.match(/"nonce"\s*:\s*"([a-f0-9]+)"/i);
    if (nonceMatch) map['nonce'] = nonceMatch[1];
  }
  
  if (!map['restNonce']) {
    const restNonceMatch = html.match(/"restNonce"\s*:\s*"([a-f0-9]+)"/i);
    if (restNonceMatch) map['restNonce'] = restNonceMatch[1];
  }

  return map;
}

function extractWpRestNonce(html) {
  const m = html.match(/"restNonce"\s*:\s*"([a-f0-9]+)"/i);
  return m ? m[1] : null;
}
function extractWpNonce(html) {
  const m = html.match(/"nonce"\s*:\s*"([a-f0-9]+)"/i);
  return m ? m[1] : null;
}
function extractRedeemNonce(html) {
  // Match: const redeemNonce = '0e14dbd03c'; hoặc "redeemNonce":"abc"
  const m = html.match(/(?:var|let|const)\s+redeemNonce\s*=\s*['"]([a-f0-9]+)['"]/)
           || html.match(/"redeemNonce"\s*[=:]\s*['"]([a-f0-9]+)['"]/i);
  return m ? m[1] : null;
}

///====================== KHOÁNG MẠCH ===================

    class KhoangMach {
        constructor() {
            this.ajaxUrl = ajaxUrl;
            this.khoangMachUrl = weburl + 'khoang-mach?t';
            this.logPrefix = '[Khoáng Mạch]';
            this.headers = {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "X-Requested-With": "XMLHttpRequest",
            };
            this.getUsersInMineNonce = null;
            this.securityToken = null;
            this.buffBought = false;
        }

        delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        async #getNonce(actionName) {
            return getSecurityNonce(this.khoangMachUrl, actionName);
        }


        async loadMines(mineType) {
            const nonce = await getSecurityNonce(this.khoangMachUrl, 'load_mines_by_type');
            if (!nonce) { showNotification('Lỗi nonce (load_mines).', 'error'); return null; }
            const payload = new URLSearchParams({ action: hData && hData.act ? hData.act.kmList :'load_mines_by_type', mine_type: mineType, security: nonce });
            try {
                const r = await fetch(this.ajaxUrl, { method: 'POST', headers: this.headers, body: payload, credentials: 'include' });
                const d = await r.json();
                return d.success ? d.data : (showNotification(d.message || 'Lỗi tải mỏ.', 'error'), null);
            } catch (e) { console.error(`${this.logPrefix} ❌ Lỗi mạng (tải mỏ):`, e); return null; }
        };

        async getAllMines(forceRefresh = false) {
            const mineTypes = ['gold', 'silver', 'copper'];
            const cacheKey = "HH3D_allMines";
            const cacheRaw = localStorage.getItem(cacheKey);

            // Kiểm tra cache (không có thời hạn — chỉ xóa khi bấm load lại)
            if (!forceRefresh && cacheRaw && cacheRaw.length > 0) {
                try {
                    const cache = JSON.parse(cacheRaw);
                    const cacheTypes = new Set((cache?.data || []).map(m => String(m?.type || '')));
                    const cacheHasAllTypes = mineTypes.every(t => cacheTypes.has(t));

                    if (cache.data && cache.data.length > 0 && cacheHasAllTypes) {
                        console.log("[HH3D] 🗄️ Dùng dữ liệu mỏ từ cache");
                        return {
                            optionsHtml: cache.optionsHtml,
                            minesData: cache.data
                        };
                    } else {
                        localStorage.removeItem(cacheKey);
                    }
                } catch (e) {
                    console.warn("[HH3D] Lỗi đọc cache:", e);
                }
            }

            // --- Nếu chưa có cache hoặc đã hết hạn, tải mới ---
            const nonce = await getSecurityNonce( this.khoangMachUrl, 'load_mines_by_type' );
            if (!nonce) {
                showNotification('Lỗi nonce (getAllMines).', 'error');
                return { optionsHtml: '', minesData: [] };
            }

            // --- Load từng loại + kiểm tra đủ 3 loại ---
            const minesByType = new Map();
            const missingTypes = new Set(mineTypes);

            const fetchMinesByType = async (type) => {
                const payload = new URLSearchParams({
                    action: hData && hData.act ? hData.act.kmList :'load_mines_by_type',
                    mine_type: type,
                    security: nonce
                });

                try {
                    const r = await fetch(this.ajaxUrl, {
                        method: 'POST',
                        headers: this.headers,
                        body: payload,
                        credentials: 'include'
                    });
                    const d = await r.json();

                    if (d && d.success && Array.isArray(d.data)) {
                        const typed = d.data.map(mine => ({ ...mine, type }));
                        minesByType.set(type, typed);
                        missingTypes.delete(type);
                        return true;
                    }

                    showNotification((d && (d.message || d?.data?.message)) || `Lỗi tải mỏ loại ${type}.`, 'error');
                    return false;
                } catch (e) {
                    console.error(`${this.logPrefix} ❌ Lỗi mạng (tải mỏ ${type}):`, e);
                    return false;
                }
            };

            const loadTypes = async (typesToLoad) => {
                await Promise.all((typesToLoad || []).map(t => fetchMinesByType(t)));
            };

            // 1) Load lần đầu
            await loadTypes(mineTypes);

            // 2) Retry loại bị thiếu (tối đa 2 lần)
            for (let attempt = 1; attempt <= 2 && missingTypes.size > 0; attempt++) {
                const retryTypes = Array.from(missingTypes);
                console.warn(`${this.logPrefix} ⚠️ getAllMines thiếu loại: ${retryTypes.join(', ')}. Retry lần ${attempt}/2...`);
                await this.delay(500 * attempt);
                await loadTypes(retryTypes);
            }

            const allMines = [];
            mineTypes.forEach(t => {
                const arr = minesByType.get(t);
                if (arr && arr.length) allMines.push(...arr);
            });

            if (missingTypes.size > 0) {
                const missing = Array.from(missingTypes);
                showNotification(`Chưa tải đủ 3 loại mỏ. Thiếu: ${missing.join(', ')}. (Không cache dữ liệu thiếu)`, 'error');
            }

            // --- Sắp xếp ---
            allMines.sort((a, b) => {
                const typeOrder = { 'gold': 1, 'silver': 2, 'copper': 3 };
                const typeComparison = typeOrder[a.type] - typeOrder[b.type];
                if (typeComparison === 0) {
                    return a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' });
                }
                return typeComparison;
            });

            // --- Sinh HTML ---
            const mineOptionsHtml = allMines.map(mine => {
                let typePrefix = '';
                if (mine.type === 'gold') typePrefix = '[Thượng] ';
                else if (mine.type === 'silver') typePrefix = '[Trung] ';
                else if (mine.type === 'copper') typePrefix = '[Hạ] ';
                return `<option value="${mine.id}">${typePrefix}${mine.name} (${mine.id})</option>`;
            }).join('');

            // --- Lưu cache (không có thời hạn) ---
            if (missingTypes.size === 0) {
                localStorage.setItem(cacheKey, JSON.stringify({
                    data: allMines,
                    optionsHtml: mineOptionsHtml
                }));
            }

            return {
                optionsHtml: mineOptionsHtml,
                minesData: allMines
            };
        }

        async enterMine(mineId) {
            // Lấy nonce
            const nonce = await this.#getNonce('enter_mine');
            if (!nonce) {
                showNotification('Lỗi nonce (enter_mine).', 'error');
                return false;
            }

            if (!nonce) {
                showNotification('Lỗi nonce (enter_mine).', 'error');
                return false;
            }

            // Hàm gửi request
            const post = async (payload) => {
                const r = await fetch(this.ajaxUrl, {
                    method: 'POST',
                    headers: this.headers,
                    body: new URLSearchParams(payload),
                    credentials: 'include'
                });
                return r.json();
            };
            this.securityToken = await getSecurityToken(this.khoangMachUrl);
            try {
                const d = await post({ action: hData && hData.act ? hData.act.kmEnter :'enter_mine', mine_id: mineId, security_token: this.securityToken, security: nonce });

                if (d.success) {
                    showNotification(d.data.message, 'success');
                    return true;
                }

                const msg = d.data.message || 'Lỗi vào mỏ.';

                if (msg.includes('đạt đủ thưởng ngày')) {
                    taskTracker.markTaskDone(accountId, 'khoangmach');
                    showNotification(msg, 'error');
                }
                else if (msg.includes('Có phần thưởng chưa nhận')) {
                    // Nếu bị sát hại tại khoáng mạch → nhận thưởng trước
                    const nonce = await this.#getNonce('claim_reward_km');
                    if (!nonce) {
                        showNotification('Lỗi nonce (claim_reward_km).', 'error');
                        return false;
                    }
                    this.securityToken = await getSecurityToken(this.khoangMachUrl);
                    const reward = await post({ action: hData && hData.act ? hData.act.kmReward :'claim_reward_km', security_token: this.securityToken, security: nonce });
                    if (reward.success) {
                        showNotification(`Nhận thưởng <b>${reward.data.total_tuvi} tu vi và ${reward.data.total_tinh_thach} tinh thạch</b> tại khoáng mạch ${reward.data.mine_name}`, 'info');
                        return this.enterMine(mineId); // gọi lại để vào mỏ
                    } else {
                        showNotification('Lỗi nhận thưởng khi bị đánh ra khỏi mỏ khoáng', 'warn');
                    }
                }

            } catch (e) {
                console.error(`${this.logPrefix} ❌ Lỗi mạng (vào mỏ):`, e);
                return false;
            }
        }

        async decodeAvatar(encoded, viewerId) {
            try {
                // ⭐ Validate input
                if (!encoded || typeof encoded !== 'string') {
                    return null;
                }
                
                const key = (viewerId % 251) + 1;
                // ⭐ Browser không có Buffer, dùng atob() để decode Base64
                const raw = atob(encoded);
                let result = '';
                for (let i = 0; i < raw.length; i++) {
                    result += String.fromCharCode(raw.charCodeAt(i) ^ (key ^ (i % 7)));
                }
                return result;
            } catch(e) {
                console.error('decodeAvatar error:', e, 'Input:', encoded);
                return null;
            }
        }
        async getIdfromAvatar(avatarUrl) {
            // ⭐ Validate input
            if (!avatarUrl || typeof avatarUrl !== 'string') {
                return null;
            }
            
            // Tách user ID từ avatar URL: /ultimatemember/{ID}/
            const idFromAvatar = (avatarUrl.match(/\/ultimatemember\/(\d+)\//i) || [])[1];
            if (idFromAvatar) return parseInt(idFromAvatar);
            return null;
        }

        async getUsersInMine(mineId) {

            // --- 1. Lấy 'security' nonce (giữ logic cache của bạn) ---
            let nonce = '';
            if (this.getUsersInMineNonce) {
                nonce = this.getUsersInMineNonce;
                console.log(`${this.logPrefix} 🗄️ Dùng 'security' nonce từ cache.`);
            } else {
                console.log(`${this.logPrefix} ▶️ Cache nonce không có, tải mới...`);
                // Giả định this.#getNonce là hàm private của class bạn
                nonce = await this.#getNonce('get_users_in_mine');

                if (nonce) {
                    this.getUsersInMineNonce = nonce; // lưu lại để dùng lần sau
                }
            }

            //Nếu page hiện tại là khoáng mạch thì lấy thẳng token từ đó
            // this.securityToken = await getSecurityToken(this.khoangMachUrl);
            this.securityToken = hData && hData.securityToken ? hData.securityToken : await getSecurityToken(this.khoangMachUrl);
            // --- 3. Kiểm tra cả hai token ---
            if (!nonce || !this.securityToken) {
                let errorMsg = 'Lỗi (get_users):';
                if (!nonce) errorMsg += " Không tìm thấy 'security' nonce.";
                if (!this.securityToken) errorMsg += " Không tìm thấy 'security_token' (hh3dData).";

                showNotification(errorMsg, 'error');
                this.getUsersInMineNonce = null; // Xóa cache nonce hỏng nếu có
                return null;
            }

            // --- 4. Tạo payload (Đã thêm security_token) ---
            const payload = new URLSearchParams({
                action: hData && hData.act ? hData.act.kmUsers :'get_users_in_mine',
                mine_id: mineId,
                security_token: this.securityToken, // <-- THÊM DÒNG NÀY
                security: nonce
            });

            // --- 5. Gửi fetch ---
            try {
                const r = await fetch(this.ajaxUrl, { method: 'POST', headers: this.headers, body: payload, credentials: 'include' });
                const d = await r.json();
                console.log(`${this.logPrefix} 🧑‍🤝‍🧑 Người trong mỏ:`, d);
                // Logic trả về của bạn (hoạt động tốt)
                return d.success ? d.data : (showNotification(d.data.message || 'Lỗi lấy thông tin người chơi.', 'error'), null);

            } catch (e) {
                console.error(`${this.logPrefix} ❌ Lỗi mạng (lấy user):`, e);
                return null;
            }
        }

        async takeOverMine(mineId) {
            const nonce = await this.#getNonce('change_mine_owner');
            if (!nonce) { showNotification('Lỗi nonce (take_over).', 'error'); return false; }
            this.securityToken = await getSecurityToken(this.khoangMachUrl);
            const payload = new URLSearchParams({ action: hData && hData.act ? hData.act.kmOwner :'change_mine_owner', mine_id: mineId, security_token: this.securityToken, security: nonce });
            try {
                const r = await fetch(this.ajaxUrl, { method: 'POST', headers: this.headers, body: payload, credentials: 'include' });
                const d = await r.json();
                if (d.success) {
                    showNotification(d.data.message, 'success');
                    return true;
                } else {
                    showNotification(d.message || 'Lỗi đoạt mỏ.', 'error');
                    return false;
                }
            } catch (e) { console.error(`${this.logPrefix} ❌ Lỗi mạng (đoạt mỏ):`, e); return false; }
        }

        async buyBuffItem() {
            const nonce = await this.#getNonce('buy_item_khoang');
            if (!nonce) { showNotification('Lỗi nonce (buy_item).', 'error'); return false; }
            const payload = new URLSearchParams({ action: hData && hData.act ? hData.act.kmBuy :'buy_item_khoang', security: nonce, item_id: 4 });
            try {
                const r = await fetch(this.ajaxUrl, { method: 'POST', headers: this.headers, body: payload, credentials: 'include' });
                const d = await r.json();
                if (d.success) {
                    showNotification(d.data.message || 'Đã mua Linh Quang Phù', 'success');
                    this.buffBought = true;
                    return true;
                } else {
                    showNotification(d.data.message || 'Lỗi mua Linh Quang Phù', 'error');
                    return false;
                }
            } catch (e) { console.error(`${this.logPrefix} ❌ Lỗi mạng (mua buff):`, e); return false; }
        }

        async claimReward(mineId) {
            const leaveMineToClaimReward = localStorage.getItem(`khoangmach_leave_mine_to_claim_reward_${accountId}`) === 'true';
            if (leaveMineToClaimReward) {
                const left = await this.leaveMine(mineId);
                if (!left) {
                    showNotification('Không thể rời mỏ để nhận thưởng.', 'error');
                    return false;
                } else {
                    await this.delay(500); // đợi 1s cho chắc
                    const entered = await this.enterMine(mineId);
                    if (!entered) {
                        showNotification('Không thể vào lại mỏ sau khi nhận thưởng.', 'error');
                        return false;
                    } else {
                        taskTracker.adjustTaskTime(accountId, 'khoangmach', timePlus('30:00'));
                        return true;
                    }
                }
            } else {
                const nonce = await this.#getNonce('claim_mycred_reward');
                if (!nonce) { showNotification('Lỗi nonce (claim_reward).', 'error'); return false; }
                this.securityToken = await getSecurityToken(this.khoangMachUrl);
                const payload = new URLSearchParams({ action: hData && hData.act ? hData.act.kmClaim :'claim_mycred_reward', mine_id: mineId, security_token: this.securityToken, security: nonce });
                try {
                    const r = await fetch(this.ajaxUrl, { method: 'POST', headers: this.headers, body: payload, credentials: 'include' });
                    const d = await r.json();
                    if (d.success) {
                        showNotification(d.data.message, 'success');
                        taskTracker.adjustTaskTime(accountId, 'khoangmach', timePlus('30:00'));
                        return true;
                    } else {
                        showNotification(d.data.message || 'Lỗi nhận thưởng.', 'error');
                        return false;
                    }
                } catch (e) { console.error(`${this.logPrefix} ❌ Lỗi mạng (nhận thưởng):`, e); return false; }
            }
        }

        async attackUser(attackToken, mineId) {
            // ✅ Kiểm tra cooldown: không cho tấn công cách nhau dưới 5500ms
            const now = Date.now();
            if (this._lastAttackTime && (now - this._lastAttackTime) < 5500) {
                const remaining = Math.ceil((5500 - (now - this._lastAttackTime)) / 1000);
                showNotification(`Vui lòng chờ ${remaining}s trước khi tấn công tiếp.`, 'warn');
                return false;
            }

            const security = await this.#getNonce('attack_user_in_mine');
            const securityToken = await getSecurityToken(this.khoangMachUrl);
            if (!security) {
                showNotification('Lỗi nonce (attack_user_in_mine).', 'error');
                return false;
            }
            console.log(`${this.logPrefix} Đang tấn công người chơi trong mỏ ${mineId} với attackToken: ${attackToken}`);
            const payload = new URLSearchParams({ action: hData && hData.act ? hData.act.kmAttack :'attack_user_in_mine', attack_token: attackToken, mine_id: mineId, security_token: securityToken, security: security });
            try {
                const r = await fetch(this.ajaxUrl, { method: 'POST', headers: this.headers, body: payload, credentials: 'include' });
                const d = await r.json();
                if (d.success) {
                    this._lastAttackTime = Date.now(); // ✅ Ghi lại thời điểm tấn công thành công
                    showNotification(d.data.message || JSON.stringify(d) || 'Đã tấn công người chơi.', 'success');
                    return true;
                } else {
                    showNotification(d.data.message || JSON.stringify(d) || 'Lỗi tấn công người chơi.', 'error');
                    return false;
                }
            } catch (e) { console.error(`${this.logPrefix} ❌ Lỗi mạng (tấn công user):`, e); return false; }
        }

        async leaveMine(mineId) {
            const nonce = await this.#getNonce('leave_mine');
            if (!nonce) { showNotification('Lỗi nonce (leave_mine).', 'error'); return false; }
            this.securityToken = await getSecurityToken(this.khoangMachUrl);
            const payload = new URLSearchParams({ action: hData && hData.act ? hData.act.kmLeave :'leave_mine', mine_id: mineId, security_token: this.securityToken, security: nonce });
            try {
                const r = await fetch(this.ajaxUrl, { method: 'POST', headers: this.headers, body: payload, credentials: 'include' });
                const d = await r.json();
                if (d.success) {
                    showNotification(d.data.message, 'success');
                    return true;
                } else {
                    showNotification(d.message || 'Lỗi rời mỏ.', 'error');
                    return false;
                }
            } catch (e) { console.error(`${this.logPrefix} ❌ Lỗi mạng (rời mỏ):`, e); return false; }
        }

        async doKhoangMach() {
            const selectedMineSetting = localStorage.getItem(`khoangmach_selected_mine_${accountId}`);
            if (!selectedMineSetting) {
                showNotification('Vui lòng chọn một mỏ trong cài đặt.', 'error');
                throw new Error('Bạn chưa chọn mỏ');
            }

            const selectedMineInfo = JSON.parse(selectedMineSetting);
            if (!selectedMineInfo || !selectedMineInfo.id || !selectedMineInfo.type) {
                showNotification('Cài đặt mỏ không hợp lệ.', 'error');
                throw new Error('Cài đặt mỏ không hợp lệ.');
            }

            const useBuff = localStorage.getItem('khoangmach_use_buff') === 'true';
            const autoTakeover = localStorage.getItem('khoangmach_auto_takeover') === 'true';
            const autoTakeoverRotation = localStorage.getItem('khoangmach_auto_takeover_rotation') === 'true';
            const rewardMode = localStorage.getItem('khoangmach_reward_mode') || 'any';
            const rewardTimeSelected = localStorage.getItem('khoangmach_reward_time');
            const rewardTime = rewardTimeSelected;
            const outerNotification = localStorage.getItem('khoangmach_outer_notification') === 'true';

            this.securityToken = await getSecurityToken(this.khoangMachUrl);
            if (!this.securityToken) {
                showNotification('Lỗi: Không lấy được security_token cho khoáng mạch.', 'error');
                throw new Error('Không lấy được security_token cho khoáng mạch.');
            }
            console.log(`${this.logPrefix} Bắt đầu quy trình cho mỏ ID: ${selectedMineInfo.id}.`);
            const mines = await this.loadMines(selectedMineInfo.type);
            if (!mines) throw new Error('Không tải danh sách khoáng mạch được');

            const targetMine = mines.find(m => m.id === selectedMineInfo.id);
            if (!targetMine) {
                showNotification('Không tìm thấy mỏ đã chọn trong danh sách tải về.', 'error');
                throw new Error('Không tìm thấy mỏ đã chọn trong danh sách.');
            }
            if (!targetMine.is_current) {
                if (parseInt(targetMine.user_count) >= parseInt(targetMine.max_users)) {
                    showNotification('Mỏ đã đầy. Không vào được.', 'warn');
                    return true;
                } else {
                    await this.enterMine(targetMine.id);
                    return true;
                }
            }

            // Bắt đầu vòng lặp để kiểm tra và thực hiện tác vụ liên tục
            while (true) {
                // Kiểm tra thông tin trong mỏ
                let mineInfo = await this.getUsersInMine(targetMine.id);
                if (!mineInfo) throw new Error('Lỗi lấy thông tin chi tiết trong mỏ');
                const users = mineInfo.users || [];
                if (users.length === 0) {
                    console.log(`[Khoáng mạch] Mỏ ${targetMine.id} trống.`);
                    showNotification('Mỏ trống trơn???', 'warn');
                    throw new Error('Mỏ trống trơn???');
                }


                // Kiểm tra vị trí trong mỏ
                let myIndex = users.findIndex(u => u.id.toString() === accountId.toString());
                if (myIndex === -1) {
                    console.log(`[Khoáng mạch] Kiểm tra vị trí. Bạn chưa vào mỏ ${targetMine.name}.`);
                    showNotification(`Bạn chưa vào mỏ ${targetMine.name}.`, 'warn');
                    return true;
                }

                // Kiểm tra ngoại tông
                const outerUsers = users.filter(u => !u.lien_minh && !u.dong_mon);
                if (outerUsers.length > 0 && outerNotification) {
                    showNotification(`Có <b>${outerUsers.length}</b> người chơi ngoại tông trong mỏ!`, 'warn');
                    this.showOuterEnemyModal(outerUsers, targetMine);
                }


                let myInfo = users[myIndex];
                console.log(`[Khoáng mạch] Vị trí: ${myIndex}, Tên: ${myInfo.name}, Time: ${myInfo.time_spent}`);

                // Kiểm tra thời gian
                if (myInfo.time_spent !== "Đạt tối đa") {
                    const timeMatch = myInfo.time_spent.match(/(\d+)\s*phút/);
                    const minutesSpent = timeMatch ? parseInt(timeMatch[1]) : 0;

                    let shouldWait = false;
                    let nextTime = null;

                    if (rewardTimeSelected === 'max') {
                        // Chờ đến khi đạt tối đa (30 phút)
                        shouldWait = true;
                        nextTime = Date.now() + Math.max(30 * 60 * 1000 - (minutesSpent * 60 * 1000), 0);
                        showNotification(`Khoáng mạch chưa đủ thời gian.<br>Hiện đạt: <b>${myInfo.time_spent}</b><br>Cần: <b>Đạt tối đa</b>`, 'warn');
                    } else {
                        // Kiểm tra với thời gian cụ thể
                        const requiredMinutes = parseInt(rewardTimeSelected);
                        if (minutesSpent < requiredMinutes) {
                            shouldWait = true;
                            nextTime = Date.now() + Math.max((requiredMinutes - minutesSpent) * 60 * 1000, 0);
                            showNotification(`Khoáng mạch chưa đủ thời gian.<br>Hiện đạt: <b>${myInfo.time_spent}</b><br>Cần: <b>${requiredMinutes} phút</b>`, 'warn');
                        }
                    }

                    if (shouldWait) {
                        taskTracker.adjustTaskTime(accountId, 'khoangmach', nextTime);
                        break;
                    }
                }

                // Kiểm tra trạng thái bonus
                let bonus = mineInfo.bonus_percentage || 0;
                let canClaim = false;
                if (rewardMode === "any") {
                    canClaim = true;
                } else if (rewardMode === "20" && bonus >= 20) {
                    canClaim = true;
                } else if (rewardMode === "100" && bonus >= 100) {
                    canClaim = true;
                } else if (rewardMode === "110" && bonus === 110) {
                    canClaim = true;
                }

                if (canClaim) {
                    console.log(`[Khoáng mạch] Nhận thưởng tại mỏ ${targetMine.id}, bonus=${bonus}%`);
                    await this.claimReward(targetMine.id);  // Nhận thưởng
                    break; // Thoát vòng lặp sau khi nhận thưởng
                } else {
                    console.log(`[Khoáng mạch] Bonus tu vi ${bonus}% chưa đạt ngưỡng ${rewardMode}`);

                    // Nếu có thể, thử takeover trước (option đoạt mỏ khi chưa buff)
                    if (autoTakeover && mineInfo.can_takeover) {
                        await this.delay(500);
                        console.log(`[Khoáng mạch] Thử đoạt mỏ ${targetMine.id}...`);
                        await this.takeOverMine(targetMine.id);
                        continue;
                    }

                    // Nếu có thể, thử takeover trước (option đoạt mỏ bất kể buff)
                    if (autoTakeoverRotation && mineInfo.can_takeover) {
                        await this.delay(500);
                        console.log(`[Khoáng mạch] Thử đoạt mỏ ${targetMine.id}...`);
                        await this.takeOverMine(targetMine.id);
                        continue;
                    }

                    // Nếu có chọn mua buff
                    if (useBuff && bonus > 20 && !this.buffBought) {
                        await this.delay(500);
                        console.log(`[Khoáng mạch] Mua linh quang phù...`);
                        await this.buyBuffItem(targetMine.id);
                        // Đợi một chút để server xử lý
                        await new Promise(resolve => setTimeout(resolve, 300));
                        continue;
                    }

                    // Nếu không thể làm gì, thoát khỏi vòng lặp
                    showNotification(`[Khoáng mạch] Bonus ${bonus}% chưa đạt ${rewardMode}%<br>Hiện không thể đoạt mỏ.<br>Không thực hiện được hành động nào.`, 'info')
                    break;
                }
            }
        }

        /**
         * Lấy danh sách tổng môn
         * @returns {Promise<Array<{id: string, name: string, level: number}>>} Mảng đối tượng tổng môn
         * ví dụ: [{id: "123", name: "Tông Môn A", level: 6}, ...]
         */
        async getListTongMon() {
            try {
                // 1. SỬA LỖI LOGIC URL: 
                // Dùng đường dẫn tương đối "/" để tự động lấy domain hiện tại.
                // Không cần biến "weburl" (tránh lỗi weburl is not defined).
                const response = await fetch("/danh-sach-cac-tong-mon-tai-hoathinh3d");
                // Kiểm tra trạng thái HTTP
                if (!response.ok) {
                    throw new Error(`Lỗi kết nối: ${response.status} ${response.statusText}`);
                }

                // 2. Chuyển đổi dữ liệu
                const htmlText = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlText, "text/html");

                // Chọn danh sách hàng
                const rows = doc.querySelectorAll('table.guild-table tbody tr');
                const results = [];
                console.log(`Tìm thấy ${rows.length} hàng tổng môn.`);

                rows.forEach(row => {
                    // ⭐ CẤU TRÚC MỚI: Tìm guild-info-wrapper
                    const guildWrapper = row.querySelector('.guild-info-wrapper');
                    if (!guildWrapper) return;

                    // ⭐ LẤY ID TỪ LINK /tong-mon/[ID]
                    const link = guildWrapper.querySelector('a[href*="/tong-mon/"]');
                    let id = null;
                    if (link) {
                        const href = link.getAttribute('href') || '';
                        const match = href.match(/\/tong-mon\/(\d+)/);
                        if (match) id = match[1];
                    }

                    // Fallback: Lấy từ nút button nếu không tìm thấy từ link
                    if (!id) {
                        const btn = row.querySelector('button.join-group');
                        id = btn ? btn.getAttribute('data-group-id') : null;
                    }

                    // ⭐ LẤY TÊN TỪ .guild-name
                    const nameSpan = guildWrapper.querySelector('.guild-name');
                    let nameText = '';
                    if (nameSpan) {
                        nameText = (nameSpan.textContent || '').trim()
                            .replace(/^[""\s]+|[""\s]+$/g, ''); // Loại bỏ dấu ngoặc kép và khoảng trắng đầu/cuối
                    }

                    // ⭐ LẤY LEVEL TỪ .guild-level
                    let levelNum = 0;
                    const levelSpan = guildWrapper.querySelector('.guild-level');
                    if (levelSpan) {
                        const levelText = levelSpan.textContent || '';
                        const match = levelText.match(/\d+/);
                        if (match) levelNum = parseInt(match[0], 10);
                    }

                    // ⭐ CHỈ LƯU KHI CÓ ID VÀ TÊN HỢP LỆ
                    if (id && nameText && nameText.length > 0) {
                        results.push({
                            id: id,
                            name: nameText,
                            level: levelNum
                        });
                        // console.log(`Tổng môn: ID=${id}, Name="${nameText}", Level=${levelNum}`);
                    }
                });

                return results;

            } catch (error) {
                // Ghi log lỗi để dễ debug
                console.error("Lỗi tại getListTongMon:", error);
                // Ném lỗi tiếp ra ngoài để hàm gọi bên ngoài biết là có lỗi
                throw error;
            }
        }


        parseGroupRoleHtml(groupRoleHtml) {
            if (!groupRoleHtml || typeof groupRoleHtml !== 'string') {
                return { tongMonName: null, role: null };
            }

            try {
                const doc = new DOMParser().parseFromString(
                    `<div>${groupRoleHtml}</div>`,
                    'text/html'
                );
                const root = doc.body;

                /* =========
                * ROLE: tooltip cuối
                * ========= */
                const tooltips = Array.from(
                    root.querySelectorAll('span[data-tooltip]')
                )
                    .map(el => el.getAttribute('data-tooltip')?.trim())
                    .filter(Boolean);

                const role = tooltips.length
                    ? tooltips[tooltips.length - 1]
                    : null;

                /* =========
                * TÊN TÔNG
                * ========= */
                let tongMonName = null;

                const bangHoiEl = root.querySelector('span[class*="bang-hoi-mau"]');
                if (bangHoiEl) {
                    const t = (bangHoiEl.textContent || '').trim();
                    if (t) tongMonName = t;
                }

                if (!tongMonName) {
                    const wrapper = root.querySelector('.tong-cap-wrapper');
                    if (wrapper) {
                        const next = wrapper.nextElementSibling;
                        if (next && next.tagName === 'SPAN') {
                            const t = (next.textContent || '').trim();
                            if (t) tongMonName = t;
                        }
                    }
                }

                return { tongMonName, role };
            } catch {
                return { tongMonName: null, role: null };
            }
        }


        /**
         * Tìm kiếm kẻ địch theo ID và/hoặc theo Tông Môn (ID tông).
         * @param {string[]} enemyList - danh sách userId (string)
         * @param {string[]} tongMonList - danh sách groupId tông môn (string)
         * @param {function} onProgressCallback - callback để cập nhật tiến độ UI
         * @returns {Promise<Array>}
         */
        async searchEnemiesInMines(enemyList, tongMonList, onProgressCallback) {
            // 1. Chuẩn bị bộ lọc (Giữ nguyên)
            const enemySet = new Set((enemyList || []).map(x => String(x).trim()).filter(Boolean));
            const tongIdSet = new Set((tongMonList || []).map(x => String(x).trim()).filter(Boolean));

            if (enemySet.size === 0 && tongIdSet.size === 0) {
                showNotification('Vui lòng nhập ID kẻ địch hoặc chọn Tông Môn để tìm.', 'warn');
                return [];
            }

            // Đọc bộ lọc mỏ từ settings
            let mineIdsFilter = null;
            try {
                const _mineRaw = localStorage.getItem('khoangmach_search_mine_ids');
                if (_mineRaw) {
                    const _arr = JSON.parse(_mineRaw);
                    if (Array.isArray(_arr) && _arr.length > 0) mineIdsFilter = _arr.map(String);
                }
            } catch(e) {}

            // Map tên tông (Giữ nguyên)
            let tongNameSet = new Set();
            if (tongIdSet.size > 0) {
                try {
                    const allTong = await this.getListTongMon();
                    tongNameSet = new Set(
                        (allTong || []).filter(t => tongIdSet.has(String(t.id)))
                            .map(t => String(t.name || '').trim()).filter(Boolean)
                    );
                } catch (e) { }
            }

            // 2. Logic Lấy dữ liệu
            let minesData = [];
            let dataTimestamp = 0;
            let dataSource = '🕵️ Quét trực tiếp';

            showNotification('Đang quét trực tiếp...', 'info');
            minesData = await this.scanAllMinesRawData(onProgressCallback, mineIdsFilter);
            dataTimestamp = Date.now();

            // 🔥 BƯỚC QUAN TRỌNG: CHUẨN HÓA DỮ LIỆU (Normalize)
            // Phải đặt ở đây để chạy cho CẢ trường hợp lấy từ Server HOẶC quét mới
            if (minesData && minesData.length > 0) {
                minesData = minesData.map(m => ({
                    ...m,
                    users: (m.users || []).map(u => ({
                        // Map key ngắn (i, n, t, r, d, l) -> key dài (id, name...)
                        id: u.i || u.id,
                        avatar: u.a || u.avatar || u.avatarUrl,
                        attack_token: u.att || u.attack_token,
                        name: u.n || u.name,
                        tongMonName: u.t || u.tongMonName,
                        role: u.r || u.role,
                        dong_mon: u.d === 1 || u.dong_mon,   // d = dong_mon
                        lien_minh: u.l === 1 || u.lien_minh, // l = lien_minh
                        ...u
                    }))
                }));
            }

            // 3. Lọc & Hiển thị
            const results = [];
            for (const mine of minesData) {
                if (!mine.users) continue;
                for (const u of mine.users) {
                    const uid = String(u.id ?? '').trim();
                    const uTong = String(u.tongMonName || '').trim();

                    // ✅ Kiểm tra xem có phải kẻ địch theo ID hoặc Tông Môn
                    const isTargetById = enemySet.has(uid);
                    const isTargetByTong = tongNameSet.has(uTong);

                    if (isTargetById || isTargetByTong) {
                        results.push({
                            ...u,
                            mineId: mine.id,
                            mineName: mine.name,
                            tongMonName: u.tongMonName,
                            role: u.role,
                            dong_mon: u.dong_mon,      // Đảm bảo truyền xuống UI
                            lien_minh: u.lien_minh     // Đảm bảo truyền xuống UI
                        });
                    }
                }
            }

            this.showEnemySearchResults(results, dataTimestamp, dataSource);
            const storageData = { results, timestamp: dataTimestamp, source: dataSource };
            sessionStorage.setItem('khoangmach_enemy_search_results', JSON.stringify(storageData));

            return results;
        }

        // Hàm phụ: Quét toàn bộ mỏ (Trả về dữ liệu thô để upload)
        async scanAllMinesRawData(onProgress, mineIdsFilter = null) {
            console.log(`${this.logPrefix} 🕵️ Bắt đầu quét toàn bộ mỏ (Mode: Raw Data)...`);

            // Get account ID for decoding avatars
            const accountId = await getAccountId();

            // Nếu có UI truyền xuống, báo cáo ngay
            if (onProgress) onProgress(0, 'Đang chuẩn bị...');

            // --- BƯỚC 1: LẤY DANH SÁCH MỎ & LỌC ---
            const allMines = await this.getAllMines();
            if (!allMines || !allMines.minesData) return [];

            // Chỉ lấy mỏ Gold/Silver
            const allowedTypes = new Set(['gold', 'silver']);
            let filteredMines = allMines.minesData.filter(m => allowedTypes.has(String(m.type)));

            // Áp dụng bộ lọc mỏ cụ thể nếu có
            if (mineIdsFilter && mineIdsFilter.length > 0) {
                const filterSet = new Set(mineIdsFilter.map(String));
                filteredMines = filteredMines.filter(m => filterSet.has(String(m.id)));
                console.log(`${this.logPrefix} 🔍 Lọc mỏ: chỉ quét ${filteredMines.length} mỏ được chọn.`);
            }

            if (filteredMines.length === 0) return [];

            // --- BƯỚC 2: CHUẨN BỊ TOKEN & NONCE (CHỈ LÀM 1 LẦN) ---

            // 2a. Lấy Security Nonce (cho action get_users_in_mine)
            let nonce = this.getUsersInMineNonce; // Kiểm tra cache xem có sẵn không
            if (!nonce) {
                console.log(`${this.logPrefix} ♻️ Đang lấy Nonce mới...`);
                // Gọi hàm getNonce (hoặc logic fetch regex tương đương)
                nonce = await this.#getNonce("get_users_in_mine");
                if (nonce) {
                    this.getUsersInMineNonce = nonce; // Lưu cache
                }
            }

            // 2b. Lấy Security Token (Session)
            if (!this.securityToken) {
                console.log(`${this.logPrefix} 🔑 Đang lấy Token mới...`);
                this.securityToken = await getSecurityToken(this.khoangMachUrl);
            }

            // 2c. Kiểm tra lần cuối, nếu thiếu 1 trong 2 thì hủy quét
            if (!nonce || !this.securityToken) {
                console.error(`${this.logPrefix} ❌ Không thể quét: Thiếu Token hoặc Nonce.`);
                showNotification('Lỗi chuẩn bị dữ liệu quét mỏ.', 'error');
                return [];
            }

            // --- BƯỚC 3: VÒNG LẶP QUÉT (DÙNG LẠI TOKEN & NONCE) ---
            const rawResult = [];
            const totalMines = filteredMines.length;
            console.log(`${this.logPrefix} 🚀 Bắt đầu quét ${totalMines} mỏ...`);

            for (let i = 0; i < totalMines; i++) {
                const m = filteredMines[i];

                // === 📞 GỌI VỀ UI ĐỂ CẬP NHẬT THANH TIẾN ĐỘ ===
                if (onProgress) {
                    const percent = Math.floor(((i + 1) / totalMines) * 100);
                    onProgress(percent, `Đang quét...`);
                }
                // ===============================================

                // Payload dùng chung nonce và securityToken đã lấy ở Bước 2
                const payload = new URLSearchParams({
                    action: hData && hData.act ? hData.act.kmUsers :'get_users_in_mine',
                    mine_id: m.id,
                    security_token: this.securityToken,
                    security: nonce
                });
                
                // 🔄 LOGIC RETRY: Thử tối đa 5 lần nếu gặp lỗi "thao tác quá nhanh" hoặc "phiên hết hạn"
                let retryCount = 0;
                const maxRetries = 5;
                let success = false;
                
                while (!success && retryCount < maxRetries) {
                    if (retryCount > 0) {
                        console.log(`${this.logPrefix} ♻️ Retry lần ${retryCount}/${maxRetries} cho mỏ ${m.name}...`);
                    } else {
                        console.log(`${this.logPrefix} Quét mỏ ${m.name} (ID: ${m.id})...`);
                    }
                    // console.log(`${this.logPrefix} Payload:`, payload.toString());
                    
                    try {
                        const r = await fetch(this.ajaxUrl, {
                            method: 'POST',
                            headers: this.headers,
                            body: payload,
                            credentials: 'include'
                        });
                        const d = await r.json();

                        if (d.success && d.data && d.data.users && d.data.users.length > 0) {
                            // MAP DATA SIÊU GỌN (để upload lên server)
                            const cleanUsers = await Promise.all(d.data.users.map(async (u) => {
                                const extra = this.parseGroupRoleHtml(u.group_role_html);
                                const avatarUrl = u.avatar || await this.decodeAvatar(u.avatar, accountId);
                                // console.log(`avatar: ${u.avatar} -> ${avatarUrl}`);
                                const attack_token = u.id;
                                // ⭐ THÊM AWAIT cho getIdfromAvatar vì nó là async function
                                const id = (await this.getIdfromAvatar(avatarUrl)) || u.id;
                                // console.log(`Quét user: ID=${id}, Name="${u.name}", TongMon="${extra.tongMonName}", Role="${extra.role}", Avatar="${avatarUrl}", Attack Token="${attack_token}"`);
                                return {
                                    i: id,                                // i = id
                                    att: attack_token,                      // att = attack_token
                                    a: avatarUrl,                        // a = avatar
                                    n: u.name,                              // n = name
                                    t: String(extra.tongMonName || '').trim(), // t = tongMon
                                    r: extra.role,                          // r = role
                                    d: u.dong_mon ? 1 : 0,                  // d = dong_mon (1/0 để tiết kiệm dung lượng)
                                    l: u.lien_minh ? 1 : 0                  // l = lien_minh
                                };
                            }));

                            rawResult.push({
                                id: m.id,
                                name: m.name,
                                users: cleanUsers
                            });
                            success = true; // ✅ Thành công, thoát vòng lặp retry
                        }
                        else if (!d.success) {
                            const errorMsg = d.data?.message || d.message || '';
                            
                            // Kiểm tra lỗi cần retry
                            const needRetry = errorMsg.includes('thao tác quá nhanh') || 
                                            errorMsg.includes('phiên hết hạn') ||
                                            errorMsg.includes('hết hạn') ||
                                            errorMsg.includes('session');
                            
                            if (needRetry && retryCount < maxRetries - 1) {
                                console.warn(`${this.logPrefix} ⚠️ Lỗi quét mỏ ${m.name}: ${errorMsg} - Đang thử lại sau 10s...`);
                                await new Promise(resolve => setTimeout(resolve, 10000)); // Delay 10 giây
                                retryCount++;
                            } else {
                                console.warn(`${this.logPrefix} ❌ Lỗi quét mỏ ${m.name}: ${errorMsg}`);
                                success = true; // Bỏ qua mỏ này, tiếp tục mỏ tiếp theo
                            }
                        }

                    } catch (e) {
                        console.error(`${this.logPrefix} ❌ Lỗi mạng mỏ ${m.id}:`, e);
                        if (retryCount < maxRetries - 1) {
                            console.log(`${this.logPrefix} ⚠️ Đang thử lại sau 10s...`);
                            await new Promise(resolve => setTimeout(resolve, 10000));
                            retryCount++;
                        } else {
                            success = true; // Đã hết lượt retry, bỏ qua
                        }
                    }
                }

                // Delay để tránh bị chặn (500ms) sau khi hoàn thành thành công hoặc hết retry
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            if (onProgress) onProgress(100, 'Hoàn tất!');
            console.log(`${this.logPrefix} ✅ Hoàn tất quét. Tổng số mỏ có người: ${rawResult.length}`);
            return rawResult;
        }

        /**
         * Hiển thị modal cảnh báo ngoại tông trong mỏ hiện tại
         * @param {Array} outerUsers Danh sách user ngoại tông
         * @param {Object} mine Thông tin mỏ hiện tại
         */
        async showOuterEnemyModal(outerUsers, mine) {
            const PANEL_ID = 'outerEnemyModal';
            const oldPanel = document.getElementById(PANEL_ID);
            if (oldPanel) oldPanel.remove();

            const accountId = await getAccountId();
            const esc = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

            const usersHtml = (await Promise.all(outerUsers.map(async (u) => {
                const attackToken = u.attack_token || u.att || u.id;
                const avatarUrl = u.avatar || await this.decodeAvatar(u.avatar, accountId);
                const id = (await this.getIdfromAvatar(avatarUrl)) || u.id;
                return `
                    <div style="padding: 8px 0; border-bottom: 1px dashed #333; display: flex; justify-content: space-between; align-items: center; gap: 10px;">
                        <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
                            <a href="/profile/${id}" target="_blank" style="flex-shrink:0;display:block">
                                <img src="${esc(avatarUrl || u.avatar)}" alt="avatar" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 1px solid #555; cursor:pointer;">
                            </a>
                            <div style="display: flex; flex-direction: column; min-width: 0; flex: 1;">
                                <div style="color: #ff6b6b; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${esc(u.name)} (${id})</div>
                                <div style="font-size: 11px; color: #777; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${esc(u.tongMonName || 'Vô phái')} - ${esc(u.role || 'Thành viên')}</div>
                            </div>
                        </div>
                        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0;">
                            <div style="display: flex; gap: 5px;">
                                <button class="oe-btn-tuvi" data-uid="${id}" data-attack-token="${attackToken}" style="border:none; background:#039be5; color:white; border-radius:3px; padding:3px 8px; font-size:11px; cursor:pointer; font-weight:bold;">👁</button>
                                <button class="oe-btn-attack" data-uid="${id}" data-attack-token="${attackToken}" data-mid="${mine.id}" style="border:none; background:#d32f2f; color:white; border-radius:3px; padding:3px 8px; font-size:11px; cursor:pointer; font-weight:bold;">👊</button>
                            </div>
                            <div id="oe-info-${id}" style="font-size:10px; color:#b0bec5; min-height:14px;"></div>
                        </div>
                    </div>
                `;
            }))).join('');

            const panel = document.createElement('div');
            panel.id = PANEL_ID;
            panel.style.cssText = `
                position: fixed; right: 20px; bottom: 20px;
                width: 400px; max-width: 95vw;
                background: #1a1a1a; color: #e0e0e0;
                border: 1px solid #c62828; border-radius: 8px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.7);
                z-index: 999999; font-family: sans-serif;
                display: flex; flex-direction: column;
                overflow: hidden; font-size: 13px;
            `;

            panel.innerHTML = `
                <div style="padding: 10px 12px; background: #c62828; border-bottom: 1px solid #b71c1c;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="font-weight: bold; font-size: 14px; color: #fff;">
                            ⚠️ Ngoại Tông Trong Mỏ <span style="background:#b71c1c; border-radius:10px; padding:1px 7px;">${outerUsers.length}</span>
                        </div>
                        <div style="display: flex; gap: 5px;">
                            <button id="oe-goto" style="background:#fff3e0; color:#e65100; border:none; border-radius:4px; padding:4px 8px; font-size:11px; cursor:pointer; font-weight:bold;">🏔 Đến KM</button>
                            <button id="oe-close" style="background:#333; border:none; color:#fff; width:28px; height:28px; border-radius:4px; cursor:pointer;">✕</button>
                        </div>
                    </div>
                    <div style="font-size:11px; color:#ffcdd2; margin-top:3px;">⛏ ${esc(mine.name)}</div>
                </div>
                <div style="padding: 8px 12px; max-height: 55vh; overflow-y: auto; background: #1a1a1a;">
                    ${usersHtml}
                </div>
            `;

            document.body.appendChild(panel);

            panel.querySelector('#oe-goto').onclick = () => { window.location.href = this.khoangMachUrl; };
            panel.querySelector('#oe-close').onclick = () => panel.remove();

            panel.querySelectorAll('.oe-btn-tuvi').forEach(btn => {
                btn.onclick = async (e) => {
                    e.stopPropagation();
                    const uid = btn.getAttribute('data-uid');
                    const resDiv = document.getElementById(`oe-info-${uid}`);
                    btn.disabled = true; btn.textContent = '...';
                    if (resDiv) resDiv.textContent = 'Đang xem...';
                    try {
                        const tierText = await hienTuviKM.getProfileTier(uid);
                        if (resDiv) resDiv.textContent = tierText || 'K.Rõ';
                    } catch (err) {
                        if (resDiv) resDiv.textContent = 'Lỗi';
                    } finally {
                        btn.textContent = '👁'; btn.disabled = false;
                    }
                };
            });

            panel.querySelectorAll('.oe-btn-attack').forEach(btn => {
                btn.onclick = (e) => {
                    e.stopPropagation();
                    const attackToken = btn.getAttribute('data-attack-token');
                    const mid = btn.getAttribute('data-mid');
                    btn.textContent = '⚔';
                    if (typeof khoangmach !== 'undefined' && khoangmach.attackUser) {
                        khoangmach.attackUser(attackToken, mid);
                        setTimeout(() => { btn.textContent = '✔'; }, 500);
                    } else {
                        showNotification('Lỗi: Không tìm thấy hàm tấn công!', 'error');
                    }
                };
            });
        }

        /**
         * Hiển thị kết quả tìm kiếm với thông tin nguồn và thời gian
         * @param {Array} foundUsers Danh sách kẻ địch tìm thấy
         * @param {Number} timestamp Thời gian dữ liệu được tạo (Date.now())
         * @param {String} source Nguồn dữ liệu ('Server' hoặc 'Quét trực tiếp')
         */
        async showEnemySearchResults(foundUsers, timestamp, source = 'N/A') {
            // 1. Kiểm tra dữ liệu đầu vào
            if (!Array.isArray(foundUsers) || foundUsers.length === 0) {
                showNotification('Không tìm thấy kẻ địch nào phù hợp trong các mỏ.', 'info');
                return;
            }

            // Get account ID
            const accountId = await getAccountId();

            const PANEL_ID = 'enemyDashboard';
            const RESTORE_ID = 'enemyDashboardRestore';

            // 2. Xóa panel cũ
            const oldPanel = document.getElementById(PANEL_ID);
            if (oldPanel) oldPanel.remove();
            const oldRestore = document.getElementById(RESTORE_ID);
            if (oldRestore) oldRestore.remove();

            // 3. Tiện ích
            const esc = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
            const timeSinceStr = (ts) => {
                if (!ts) return 'Vừa xong';
                const seconds = Math.floor((Date.now() - ts) / 1000);
                if (seconds < 60) return `${seconds} giây trước`;
                const minutes = Math.floor(seconds / 60);
                if (minutes < 60) return `${minutes} phút trước`;
                return 'Khá lâu trước';
            };

            // 4. Gom nhóm
            const minesMap = foundUsers.reduce((acc, u) => {
                const mId = String(u.mineId || 'unknown');
                if (!acc[mId]) {
                    acc[mId] = {
                        id: mId,
                        name: u.mineName || 'Mỏ Lạ',
                        users: [],
                        tongMons: new Set()
                    };
                }
                acc[mId].users.push(u);
                if (u.tongMonName) acc[mId].tongMons.add(u.tongMonName);
                return acc;
            }, {});

            const sortedMines = Object.values(minesMap).sort((a, b) => b.users.length - a.users.length);

            // 5. Tạo Panel
            const panel = document.createElement('div');
            panel.id = PANEL_ID;
            panel.className = 'enemy-dashboard';
            panel.style.cssText = `
                position: fixed; right: 20px; bottom: 20px;
                width: 460px; max-width: 95vw;
                background: #1a1a1a; color: #e0e0e0;
                border: 1px solid #444; border-radius: 8px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.7);
                z-index: 999999; font-family: sans-serif;
                display: flex; flex-direction: column;
                overflow: hidden; font-size: 13px;
            `;

            const sourceColor = source.includes('Server') ? '#4caf50' : '#ff9800';

            // HTML Structure - Build mines HTML first
            const minesHtml = (await Promise.all(sortedMines.map(async (mine) => {
                const tongList = mine.tongMons.size > 0 ? Array.from(mine.tongMons).join(', ') : 'Vô phái';
                const usersHtml = (await Promise.all(mine.users.map(async (u) => {
                    const isAlly = u.dong_mon || u.lien_minh;
                    const attackToken = u.attack_token || u.att || u.id;
                    const avatarUrl = u.avatar || await this.decodeAvatar(u.avatar, accountId);
                    // console.log(`Avatar URL for user ${u.name} (ID: ${u.id}): ${avatarUrl} (avatar: ${u.avatar})`);
                    // ⭐ THÊM AWAIT cho getIdfromAvatar vì nó là async function
                    const id = (await this.getIdfromAvatar(avatarUrl)) || u.id;
                    // console.log(`User: ${u.name}, ID: ${id}, Đồng Môn: ${u.dong_mon}, Liên Minh: ${u.lien_minh}`);
                    const allyLabel = u.dong_mon ? '☯️ Đồng Môn' : (u.lien_minh ? '🤝 Liên Minh' : '');
                    const nameColor = isAlly ? '#4caf50' : '#ff6b6b';
                    return `
                        <div style="padding: 6px 0; border-bottom: 1px dashed #333; display: flex; justify-content: space-between; align-items: center; gap: 10px;">
                            <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
                                <a href="/profile/${id}" target="_blank" style="flex-shrink:0;display:block">
                                    <img src="${avatarUrl || u.a || u.avatar}" alt="avatar" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 1px solid #555; cursor:pointer;">
                                </a>
                                <div style="display: flex; flex-direction: column; min-width: 0; flex: 1;">
                                    <div style="color: ${nameColor}; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${esc(u.name)} ${allyLabel ? `<span style="font-size: 10px;">${allyLabel}</span>` : ''} (${id})</div>
                                    <div style="font-size: 11px; color: #777; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${esc(u.tongMonName || 'Vô phái')} - ${esc(u.role || 'Thành viên')}</div>
                                </div>
                            </div>
                            
                            <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0;">
                                ${ isAlly ? 
                                    `<div style="display: flex; gap: 5px;">
                                        <button class="btn-check-tuvi" data-uid="${id}" data-attack-token="${attackToken}" data-ally="${isAlly ? '1' : '0'}" style="border:none; background: #039be5; color: white; border-radius: 3px; padding: 3px 8px; font-size: 11px; cursor: pointer; font-weight: bold;">👁</button>
                                        <!-- <button class="btn-attack" data-uid="${id}" data-attack-token="${attackToken}" data-mid="${mine.id}" style="border:none; background: #d32f2f; color: white; border-radius: 3px; padding: 3px 8px; font-size: 11px; cursor: pointer; font-weight: bold;">👊</button> -->
                                    </div>
                                    <div id="info-res-${id}" style="font-size: 10px; color: #b0bec5; min-height: 14px;"></div>`
                                    : 
                                    `<div style="display: flex; gap: 5px;">
                                        <button class="btn-check-tuvi" data-uid="${id}" data-attack-token="${attackToken}" data-ally="${isAlly ? '1' : '0'}" style="border:none; background: #039be5; color: white; border-radius: 3px; padding: 3px 8px; font-size: 11px; cursor: pointer; font-weight: bold;">👁</button>
                                        <button class="btn-attack" data-uid="${id}" data-attack-token="${attackToken}" data-mid="${mine.id}" style="border:none; background: #d32f2f; color: white; border-radius: 3px; padding: 3px 8px; font-size: 11px; cursor: pointer; font-weight: bold;">👊</button>
                                    </div>
                                    <div id="info-res-${id}" style="font-size: 10px; color: #b0bec5; min-height: 14px;"></div>`
                                }
                            </div>
                        </div>
                    `;
                }))).join('');
                
                return `
                    <div style="margin-bottom: 8px; border: 1px solid #333; border-radius: 6px; overflow: hidden;">
                        <div class="mine-header" data-target="m-${mine.id}" style="padding: 8px 10px; background: #252525; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                            <div style="display: flex; align-items: center; gap: 8px; flex: 1;">
                                <div style="flex: 1;">
                                    <div style="font-weight: bold; color: #ffd700;">⛏ ${esc(mine.name)}</div>
                                    <div style="font-size: 11px; color: #888;">Quân số: ${mine.users.length} | Phe: ${esc(tongList)}</div>
                                </div>
                                <button class="btn-scan-mine" data-target="m-${mine.id}" style="border: 1px solid #555; background: #333; color: #ccc; border-radius: 3px; padding: 2px 6px; font-size: 10px; cursor: pointer;">👁 Soi Mỏ</button>
                                <button id="btn-weak-mine-${mine.id}" class="btn-attack-weak-mine" data-target="m-${mine.id}" style="background: #ef5350; color: #fff; border: none; border-radius: 3px; padding: 2px 6px; font-size: 10px; cursor: pointer; display: none; font-weight: bold;">👊 Đấm Kẻ Yếu</button>
                            </div>
                            <span class="arrow" style="font-size: 10px; color: #666; margin-left: 8px;">▼</span>
                        </div>
                        
                        <div id="m-${mine.id}" class="mine-content" style="display: none; padding: 5px 10px; background: #151515; border-top: 1px solid #333;">
                            ${usersHtml}
                        </div>
                    </div>
                `;
            }))).join('');

            // HTML Structure
            panel.innerHTML = `
                <div class="ed-header" style="padding: 10px 12px; background: #2d2d2d; border-bottom: 1px solid #3d3d3d;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                        <div style="font-weight: bold; font-size: 14px; color: #fff;">
                            🎯 Tìm thấy <span style="color: #ff5252;">${foundUsers.length}</span> mục tiêu
                        </div>
                        <div style="display: flex; gap: 5px;">
                            <button id="btn-scan-all" style="background: #7b1fa2; color: #fff; border: none; border-radius: 4px; padding: 4px 8px; font-size: 11px; cursor: pointer; font-weight: bold;">👁 Soi tu vi</button>
                            <button id="btn-attack-weak-global" style="background: #c62828; color: #fff; border: none; border-radius: 4px; padding: 4px 8px; font-size: 11px; cursor: pointer; font-weight: bold; display: none;">👊 Đấm Kẻ Yếu (0)</button>
                            
                            <button id="edMin" style="background:#3d3d3d; border:none; color:#fff; width:28px; height:28px; border-radius:4px; cursor:pointer;">—</button>
                            <button id="edClose" style="background:#d32f2f; border:none; color:#fff; width:28px; height:28px; border-radius:4px; cursor:pointer;">✕</button>
                        </div>
                    </div>
                    <div style="font-size: 11px; color: #aaa;">
                        Nguồn: <span style="font-weight:bold; color: ${sourceColor}">${source}</span> • ${timeSinceStr(timestamp)}
                    </div>
                </div>

                <div class="ed-body" style="padding: 10px; max-height: 60vh; overflow-y: auto; background: #1a1a1a;">
                    ${minesHtml}
                </div>
            `;

            document.body.appendChild(panel);

            // Nút Restore
            const restoreBtn = document.createElement('button');
            restoreBtn.id = RESTORE_ID;
            restoreBtn.textContent = `🎯 (${foundUsers.length})`;
            restoreBtn.style.cssText = `display: none; position: fixed; bottom: 20px; right: 20px; padding: 8px 12px; border-radius: 20px; background: #2196f3; color: white; border: none; box-shadow: 0 5px 15px rgba(0,0,0,0.3); cursor: pointer; z-index: 999999; font-weight: bold;`;
            document.body.appendChild(restoreBtn);

            // Event Handlers cơ bản
            panel.querySelector('#edMin').onclick = () => { panel.style.display = 'none'; restoreBtn.style.display = 'block'; };
            panel.querySelector('#edClose').onclick = () => { panel.remove(); restoreBtn.remove(); };
            restoreBtn.onclick = () => { panel.style.display = 'flex'; restoreBtn.style.display = 'none'; };

            // Accordion Logic
            panel.querySelectorAll('.mine-header').forEach(header => {
                header.onclick = (e) => {
                    if (e.target.tagName === 'BUTTON') return;
                    const targetId = header.getAttribute('data-target');
                    const content = document.getElementById(targetId);
                    const arrow = header.querySelector('.arrow');
                    if (content) {
                        const isOpen = content.style.display === 'block';
                        content.style.display = isOpen ? 'none' : 'block';
                        if (arrow) arrow.textContent = isOpen ? '▼' : '▲';
                    }
                };
            });

            // Mở mỏ đầu tiên
            const firstHeader = panel.querySelector('.mine-header');
            if (firstHeader) firstHeader.click();

            // Biến quản lý trạng thái nút Global
            const btnWeakGlobal = panel.querySelector('#btn-attack-weak-global');
            let weakCountGlobal = 0;

            // ============================================================
            // ⚔️ LOGIC: HELPER HÀM ĐẤM TỰ ĐỘNG (Dùng chung)
            // ============================================================
            const runBatchAttack = async (targets, statusBtn) => {
                if (targets.length === 0) {
                    showNotification('Không có mục tiêu nào!', 'warning');
                    return;
                }

                if (!confirm(`Tìm thấy ${targets.length} mục tiêu "Không tốn lượt".\nBắt đầu đấm? (Delay 6s/người)`)) {
                    return;
                }

                const originalText = statusBtn.textContent;
                statusBtn.disabled = true;

                for (let i = 0; i < targets.length; i++) {
                    const btn = targets[i];

                    // Cập nhật trạng thái nút
                    statusBtn.textContent = `⏳ ${i + 1}/${targets.length} (Chờ 6s)`;

                    // Thực hiện đấm
                    btn.click();

                    // Xóa class
                    btn.classList.remove('is-weak-target');
                    btn.style.border = 'none';

                    // Delay 6s (Trừ người cuối cùng)
                    if (i < targets.length - 1) {
                        await new Promise(r => setTimeout(r, 6000));
                    }
                }

                statusBtn.textContent = '✅ Xong';
                setTimeout(() => {
                    statusBtn.style.display = 'none'; // Ẩn nút sau khi xong
                    statusBtn.disabled = false;
                    statusBtn.textContent = originalText;
                }, 3000);
                showNotification('Đã xử lý xong danh sách!', 'success');
            };

            // ============================================================
            // ⚔️ LOGIC: CHECK TU VI
            // ============================================================
            panel.querySelectorAll('.btn-check-tuvi').forEach(btn => {
                btn.onclick = async (e) => {
                    e.stopPropagation();
                    const uid = btn.getAttribute('data-uid');
                    const resDiv = document.getElementById(`info-res-${uid}`);
                    const attackBtn = btn.parentElement.querySelector('.btn-attack');

                    btn.disabled = true;
                    btn.textContent = '...';
                    resDiv.textContent = 'Đang xem...';

                    try {
                        // const data = await hienTuviKM.getProfileTier(uid);
                        const tierText = await hienTuviKM.getProfileTier(uid);

                        // if (data) {
                        //     const tuViStr = new Intl.NumberFormat('vi-VN').format(data.tuVi || 0);
                        //     let rightSideHtml = '';

                        //     // ⚡ KÈO THƠM: KHÔNG TỐN LƯỢT
                        //     if (data.notCountAttack) {
                        //         rightSideHtml = `<span style="color: #ea80fc; font-weight: bold; text-shadow: 0 0 5px rgba(234,128,252,0.5);">⚡ Không tốn lượt</span>`;

                        //         // Đánh dấu nút tấn công
                        //         if (attackBtn) {
                        //             attackBtn.classList.add('is-weak-target');
                        //             attackBtn.style.border = '1px solid #ea80fc';
                        //             attackBtn.style.boxShadow = '0 0 5px #ea80fc';

                        //             // 1. Cập nhật nút Global
                        //             weakCountGlobal++;
                        //             btnWeakGlobal.style.display = 'block';
                        //             btnWeakGlobal.textContent = `👊 Đấm Kẻ Yếu (${weakCountGlobal})`;

                        //             // 2. Cập nhật nút Local (Của mỏ)
                        //             const mid = attackBtn.getAttribute('data-mid');
                        //             const btnWeakMine = document.getElementById(`btn-weak-mine-${mid}`);
                        //             if (btnWeakMine) {
                        //                 btnWeakMine.style.display = 'block';
                        //                 // Tăng đếm cho mỏ (lưu vào attribute data-count)
                        //                 let currentCount = parseInt(btnWeakMine.getAttribute('data-count') || 0) + 1;
                        //                 btnWeakMine.setAttribute('data-count', currentCount);
                        //                 btnWeakMine.textContent = `👊 Đấm Kẻ Yếu (${currentCount})`;
                        //             }
                        //         }

                        //     } else {
                        //         // Kèo thường
                        //         const winRateRaw = data.winRate || '?';
                        //         const winRateDisplay = String(winRateRaw).includes('%') ? winRateRaw : `${winRateRaw}%`;
                        //         let rateNumber = parseInt(String(winRateRaw).replace('%', ''));
                        //         if (isNaN(rateNumber)) rateNumber = -1;

                        //         let rateColor = '#ffffff';
                        //         if (rateNumber === -1) rateColor = '#808080';
                        //         else if (rateNumber < 25) rateColor = '#ff5f5f';
                        //         else if (rateNumber > 75) rateColor = '#00ff00';

                        //         rightSideHtml = `<span style="color: ${rateColor}; font-weight: bold;">${winRateDisplay}</span>`;

                        //         // Xóa dấu hiệu nếu user soi lại và thấy không còn ngon
                        //         if (attackBtn && attackBtn.classList.contains('is-weak-target')) {
                        //             attackBtn.classList.remove('is-weak-target');
                        //             attackBtn.style.border = 'none';
                        //             attackBtn.style.boxShadow = 'none';
                        //         }
                        //     }

                        //     resDiv.innerHTML = `<span style="color: #4fc3f7;">${tuViStr}</span> | ${rightSideHtml}`;
                        // } else 
                        {
                            // resDiv.textContent = 'K.Rõ';
                            resDiv.textContent = `${tierText}`;
                            resDiv.style.color = '#ff5252';
                        }
                    } catch (err) {
                        console.error(err);
                        resDiv.textContent = 'Lỗi';
                    } finally {
                        btn.textContent = '👁';
                        btn.disabled = false;
                        btn.classList.add('checked-done');
                    }
                };
            });

            // ============================================================
            // ⚔️ LOGIC: ATTACK (Đơn lẻ)
            // ============================================================
            panel.querySelectorAll('.btn-attack').forEach(btn => {
                btn.onclick = (e) => {
                    e.stopPropagation();
                    const uid = btn.getAttribute('data-uid');
                    const attackToken = btn.getAttribute('data-attack-token');
                    const mid = btn.getAttribute('data-mid');
                    btn.textContent = '⚔';

                    if (typeof khoangmach !== 'undefined' && khoangmach.attackUser) {
                        khoangmach.attackUser(attackToken, mid);
                        setTimeout(() => {
                            btn.textContent = '✔';
                            // btn.style.opacity = '0.5';
                        }, 500);
                    } else {
                        showNotification("Lỗi: Không tìm thấy hàm tấn công!", "error");
                    }
                };
            });

            // ============================================================
            // 🚀 LOGIC: SOI HÀNG LOẠT (Global & Local)
            // ============================================================
            const runBatchScan = async (buttons) => {
                if (!buttons || buttons.length === 0) return;

                // Khi soi mới, cần reset các biến đếm nếu muốn chính xác tuyệt đối, 
                // nhưng ở đây ta cứ cộng dồn cho đơn giản hoặc user tự tắt bật lại panel.
                showNotification(`Đang soi ${buttons.length} mục tiêu...`, 'info');

                for (const btn of buttons) {
                    if (!btn.disabled && !btn.classList.contains('checked-done')) {
                        btn.click();
                        await new Promise(r => setTimeout(r, 500)); // Delay soi 500ms
                    }
                }
                showNotification('Đã soi xong.', 'success');
            };

            panel.querySelector('#btn-scan-all').onclick = () => {
                // Reset đếm toàn cục khi soi lại từ đầu (tuỳ chọn)
                weakCountGlobal = 0;
                btnWeakGlobal.style.display = 'none';

                const allBtns = panel.querySelectorAll('.btn-check-tuvi');
                runBatchScan(allBtns);
            };

            panel.querySelectorAll('.btn-scan-mine').forEach(btn => {
                btn.onclick = (e) => {
                    e.stopPropagation();
                    const targetId = btn.getAttribute('data-target');
                    const mineContainer = document.getElementById(targetId);

                    // Reset đếm cục bộ của mỏ này
                    const mid = targetId.replace('m-', '');
                    const btnWeakMine = document.getElementById(`btn-weak-mine-${mid}`);
                    if (btnWeakMine) {
                        btnWeakMine.style.display = 'none';
                        btnWeakMine.setAttribute('data-count', 0);
                    }

                    if (mineContainer && mineContainer.style.display === 'none') mineContainer.style.display = 'block';
                    if (mineContainer) {
                        runBatchScan(mineContainer.querySelectorAll('.btn-check-tuvi'));
                    }
                };
            });

            // ============================================================
            // 💀 LOGIC: ĐẤM KẺ YẾU (Xử lý sự kiện click)
            // ============================================================

            // 1. Sự kiện nút Tổng (Global)
            btnWeakGlobal.onclick = () => {
                const targets = panel.querySelectorAll('.btn-attack.is-weak-target');
                runBatchAttack(targets, btnWeakGlobal);
            };

            // 2. Sự kiện nút Từng Mỏ (Local)
            panel.querySelectorAll('.btn-attack-weak-mine').forEach(btn => {
                btn.onclick = (e) => {
                    e.stopPropagation(); // Không đóng mở accordion
                    const targetId = btn.getAttribute('data-target'); // m-xxxx
                    const mineContainer = document.getElementById(targetId);
                    if (mineContainer) {
                        // Chỉ tìm kẻ yếu trong mỏ này
                        const targets = mineContainer.querySelectorAll('.btn-attack.is-weak-target');
                        runBatchAttack(targets, btn);
                    }
                };
            });
        }

    }


//==================================
// RƯƠNG HOẠT ĐỘNG NGÀY
//==================================
class HoatDongNgay {
    constructor() {
        this.ajaxUrl = weburl + "/wp-admin/admin-ajax.php";
    }

    // 📦 Lấy rương (Daily Chest)
    async getDailyChest(stage) {
        if (stage !== "stage1" && stage !== "stage2") {
            console.error("Lỗi: Stage phải là 'stage1' hoặc 'stage2'.");
            return false;
        }

        const bodyData = new URLSearchParams({
            action: "daily_activity_reward",
            stage: stage,
            security_token: securityToken // thêm token vào đây
        });

        try {
            const response = await fetch(this.ajaxUrl, {
                credentials: "include",
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:142.0) Gecko/20100101 Firefox/142.0",
                    "Accept": "*/*",
                    "Accept-Language": "vi,en-US;q=0.5",
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                    "X-Requested-With": "XMLHttpRequest"
                },
                body: bodyData,
                method: "POST",
                mode: "cors"
            });

            const data = await response.json();
            if (data.success || data.data.message === "Đạo hữu đã nhận phần thưởng này rồi.") {
                return true;
            } else {
                console.error(`Lỗi khi nhận rương ${stage}:`, JSON.stringify(data));
                showNotification(`❌ Lỗi nhận rương hàng ngày: ${data.data.message || data.message || JSON.stringify(data)}`, "error");
                return false;
            }
        } catch (error) {
            console.error(`Lỗi khi lấy rương ${stage}:`, error);
            showNotification(`❌ Lỗi khi lấy rương ${stage}: ${error.message || JSON.stringify(error)}`, "error");
            return false;
        }
    }

    // 🎰 Spin vòng quay phúc vận
    async spinLottery() {
        const nonce = await getSecurityNonce(weburl + '?t=' + Date.now(), "restNonce");
        //console.log("🔑 Nonce spinLottery:", nonce);

        if (!nonce) {
            showNotification("❌ Lỗi: Không thể lấy nonce cho vòng quay phúc vận", "error");
            return false;
        }

        const spinURL = weburl + "wp-json/lottery/v1/" + (hData && hData.act ? hData.act.lotterySpin :'815b016f');
        console.log("🎰 URL vòng quay phúc vận:", spinURL);
        let remainingSpins = 4;

        do {
            try {
                const response = await fetch(spinURL, {
                    credentials: "include",
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:142.0) Gecko/20100101 Firefox/142.0",
                        "Accept": "*/*",
                        "Accept-Language": "vi,en-US;q=0.5",
                        "X-Security-Token": securityToken,
                        "X-WP-Nonce": nonce,
                        "Content-Type": "application/json"
                    },
                    method: "POST",
                    mode: "cors"
                });

                const data = await response.json();
                if (data.success) {
                    showNotification(`🎉 Vòng quay phúc vận: ${data.message}`, "success");
                    remainingSpins = data.user_info.remaining_spins;
                    if (remainingSpins === 0) {
                        return true;
                    }
                } else if (data.message === "Đạo hữu đã hết lượt quay hôm nay.") {
                    return true;
                } else {
                    showNotification(`❌ Lỗi khi quay vòng quay phúc vận: ${data.message}`, "error");
                    return false;
                }
            } catch (error) {
                console.error("Lỗi khi spin:", error);
                return false;
            }

            // ⏳ Chờ 1 giây tránh spam
            await new Promise(r => setTimeout(r, 1000));
        } while (remainingSpins > 0);
    }

    // 🏆 Thực hiện toàn bộ hoạt động ngày
    async doHoatDongNgay() {
        if (taskTracker.isTaskDone(accountId, "hoatdongngay")) { 
            console.log("Hoạt động ngày hôm nay đã hoàn thành, bỏ qua...");
            showNotification("✅ Hoạt động ngày hôm nay đã hoàn thành!", "success");
            return;
        }
        console.log("Bắt đầu nhận rương hoạt động ngày...");
        const chest1 = await this.getDailyChest("stage1");
        await new Promise(r => setTimeout(r, 5000)); // Delay 5s giữa 2 rương
        const chest2 = await this.getDailyChest("stage2");
        const spin = await this.spinLottery();
        const phaptuong = await khactran.autoActivateSeal();

        if (chest1 && chest2 && spin) {
            taskTracker.markTaskDone(accountId, "hoatdongngay");            
            showNotification( "✅ Hoàn thành hoạt động ngày + vòng quay phúc vận","success");
        }
    }
}


// ===============================================
    // EVENT ĐUA TOP
    // ===============================================
    // --- CẤU HÌNH ---
    const SECRET_API_URL = 'https://script.google.com/macros/s/AKfycbwOuq62VOwVB0RGraqKUvicsXZjsqsziFDwts0jktwQb2vCPSoJ3t98xGr26yNgfIvZ/exec';

    async function doDuaTopTongMon() {
        const duaTopUrl = weburl + 'wp-json/hh3d/v1/action';
        const nonce = await getNonce();
        if (!nonce) return console.error('Lỗi nonce.');

        // 1. Load Data
        if (!vandap.questionDataCache) {
            await vandap.loadAnswersFromGitHub();
        }
        const securityToken = await getSecurityToken(weburl + 'dua-top-hh3d?t');

        try {
            // 2. Lấy câu hỏi
            const rGet = await fetch(duaTopUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': nonce, 'X-DuaTop-Token': securityToken },
                body: JSON.stringify({ action: 'hh3d_get_question', dua_top_token: securityToken }),
                credentials: 'include'
            });
            const dGet = await rGet.json();

            if (!dGet || dGet.error || !dGet.id) {
                showNotification(dGet.message, 'warn');
                if (dGet.message && dGet.message.includes('Chưa đến thời gian kế tiếp')) {
                    const nextTimeMatch = dGet.message.match(/(\d{2}) giờ (\d{2}) phút (\d{2}) giây/);
                    if (nextTimeMatch) {
                        const hours = parseInt(nextTimeMatch[1], 10);
                        const minutes = parseInt(nextTimeMatch[2], 10);
                        const seconds = parseInt(nextTimeMatch[3], 10);
                        const nextTime = Date.now() + ((hours * 3600) + (minutes * 60) + seconds) * 1000;
                        taskTracker.adjustTaskTime(accountId, 'event', nextTime);
                    }
                }
                return;
            }

            console.log(`[Đua Top] ❓ ${dGet.question}`);

            // --- HÀM GỌI SERVER ---
            const callSecretServer = (action, question, answer = null) => {
                console.log(`[Sync] ☁️ Đang gửi lệnh ${action}...`);
                fetch(SECRET_API_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: action,
                        question: question,
                        answer: answer
                    })
                }).then(() => console.log(`[Sync] ✅ Lệnh ${action} đã gửi đi!`))
                .catch(e => console.error(`[Sync] ❌ Lỗi kết nối server:`, e));
            };

            // --- HÀM SUBMIT ---
            const submitAnswer = async (index, isManual = false) => {
                const rSub = await fetch(duaTopUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': nonce, 'X-DuaTop-Token': securityToken },
                    body: JSON.stringify({
                        action: "hh3d_submit_answer",
                        question_id: dGet.id,
                        selected_answer: index,
                        dua_top_token: securityToken
                    }),
                    credentials: 'include'
                });
                const dSub = await rSub.json();

                if (dSub.correct) {
                    showNotification(`[Đua Top] Hoàn thành, được ${dSub.points} tu vi`, 'success');
                    taskTracker.adjustTaskTime(accountId, 'event', Date.now() + 6.5 * 60 * 60 * 1000 + 30 * 1000);
                    if (Swal.isVisible()) Swal.close();

                    if (isManual) {
                        const ansText = dGet.options[index];
                        callSecretServer('save', dGet.question, ansText);
                        if (vandap.questionDataCache) vandap.questionDataCache.questions[dGet.question] = ansText;
                    }
                } else {
                    showNotification(`[Đua Top] Sai rồi! Câu hỏi: ${dGet.question}. Đang tiến hành sửa dữ liệu gốc`, 'error');
                    taskTracker.adjustTaskTime(accountId, 'event', Date.now() + 5 * 60 * 1000 + 15 * 1000);

                    if (vandap && vandap.questionDataCache && vandap.questionDataCache.questions) {
                        const normalize = (str) => str ? str.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?\s]/g, '') : '';
                        const currentQNorm = normalize(dGet.question);
                        const keyToDelete = Object.keys(vandap.questionDataCache.questions).find(k => normalize(k) === currentQNorm);

                        if (keyToDelete) {
                            console.warn(`[Auto] 🗑️ Phát hiện dữ liệu sai, đang xóa: "${keyToDelete}"`);
                            delete vandap.questionDataCache.questions[keyToDelete];
                            callSecretServer('delete', keyToDelete);
                        }
                    }
                }
            };

            // 3. Logic tìm kiếm
            // Normalize 1: Xóa hết ký tự đặc biệt VÀ khoảng trắng (dùng để tìm key câu hỏi)
            const normalize = (str) => str ? str.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?\s]/g, '') : '';

            // Tokenize: Giữ lại khoảng trắng để tách từ (dùng để so sánh điểm trùng lặp đáp án)
            const tokenize = (str) => str ? str.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, ' ').trim().split(/\s+/).filter(x => x) : [];

            const svQuesNorm = normalize(dGet.question);
            let foundAnswerText = null;

            if (vandap.questionDataCache && vandap.questionDataCache.questions) {
                for (const key in vandap.questionDataCache.questions) {
                    if (normalize(key) === svQuesNorm) {
                        foundAnswerText = vandap.questionDataCache.questions[key];
                        break;
                    }
                }
            }

            // 4. Quyết định
            if (foundAnswerText) {
                console.log(`[Đua Top] 💡 Dữ liệu gốc: "${foundAnswerText}"`);

                // Bước 1: Thử tìm chính xác
                let idx = dGet.options.findIndex(opt => normalize(opt) === normalize(foundAnswerText));

                // Bước 2: Tìm theo điểm trùng từ
                if (idx === -1) {
                    console.warn('[Đua Top] ⚠️ Không khớp chính xác, tính điểm trùng từ...');
                    let maxScore = -1;
                    let bestIdx = -1;
                    const targetTokens = tokenize(foundAnswerText);

                    dGet.options.forEach((opt, i) => {
                        const optTokens = tokenize(opt);
                        const intersection = optTokens.filter(token => targetTokens.includes(token));
                        const score = intersection.length;
                        if (score > maxScore) {
                            maxScore = score;
                            bestIdx = i;
                        }
                    });

                    if (bestIdx > -1 && maxScore > 0) {
                        idx = bestIdx;
                    }
                }

                if (idx > -1) {
                    await submitAnswer(idx, false);
                } else {
                    console.warn('[Đua Top] 🛑 Có đáp án mẫu nhưng không khớp option.');

                    // --- SỬA LỖI HIỂN THỊ TẠI ĐÂY ---
                    // Đưa text gợi ý vào thành HTML
                    const buttonsHtml = dGet.options.map((opt, i) =>
                        `<button id="btn-opt-${i}" class="swal2-confirm swal2-styled"
                        style="display:block; width:100%; margin: 5px 0; background-color: #3085d6;">${opt}</button>`
                    ).join('');

                    // Tạo đoạn HTML chứa cả Gợi ý và Nút
                    const contentHtml = `
                        <div style="margin-bottom: 15px; color: #d33; font-weight: bold; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                            Gợi ý: ${foundAnswerText}
                        </div>
                        <div>${buttonsHtml}</div>
                    `;

                    await Swal.fire({
                        title: dGet.question,
                        html: contentHtml, // Dùng duy nhất html
                        showConfirmButton: false, showCancelButton: true, cancelButtonText: 'Bỏ qua',
                        didOpen: () => {
                            dGet.options.forEach((_, i) => {
                                const btn = document.getElementById(`btn-opt-${i}`);
                                if (btn) btn.onclick = () => submitAnswer(i, true);
                            });
                        }
                    });
                }

            } else {
                console.warn('[Đua Top] 🛑 Hỏi người dùng (Chưa có dữ liệu)...');

                // --- SỬA LỖI HIỂN THỊ TẠI ĐÂY (TRƯỜNG HỢP KHÔNG CÓ DATA) ---
                const buttonsHtml = dGet.options.map((opt, idx) =>
                    `<button id="btn-opt-${idx}" class="swal2-confirm swal2-styled"
                    style="display:block; width:100%; margin: 5px 0; background-color: #3085d6;">${opt}</button>`
                ).join('');

                await Swal.fire({
                    title: dGet.question,
                    // Không dùng 'text' nữa vì tiêu đề đã có câu hỏi rồi, hoặc nếu muốn hiện lại câu hỏi thì đưa vào html
                    html: buttonsHtml,
                    showConfirmButton: false, showCancelButton: true, cancelButtonText: 'Bỏ qua',
                    didOpen: () => {
                        dGet.options.forEach((_, idx) => {
                            const btn = document.getElementById(`btn-opt-${idx}`);
                            if (btn) btn.onclick = () => submitAnswer(idx, true);
                        });
                    }
                });
            }
        } catch (e) { console.error('[Đua Top] Lỗi:', e); }
    }


    // ===============================================
    // HÀM HIỂN THỊ THÔNG BÁO
    //
    /**
        * HÀM HIỂN THỊ THÔNG BÁO
        * @param {*} message: nội dung thông báo (hỗ trợ HTML)
        * @param {*} type: success, warn, error, info
        * @param {*} duration: thời gian hiển thị (ms)

            */

    (function initNotificationContainer() {
        const check = setInterval(() => {
            if (document.body) {
                clearInterval(check);
                if (!document.getElementById('hh3d-notification-container')) {
                    const container = document.createElement('div');
                    container.id = 'hh3d-notification-container';
                    document.body.appendChild(container);
                }
            }
        }, 100);
    })();


        // ===============================================
        // LOG BUFFER (dùng cho tab Log trong settings)
        // ===============================================
        const HH3D_LOG_BUFFER_MAX = 200;
        window.hh3dLogBuffer = window.hh3dLogBuffer || [];

        function hh3dPushLog(message, type = 'info') {
            const plain = String(message).replace(/<[^>]*>/g, '');
            window.hh3dLogBuffer.push({ time: Date.now(), message: plain, type });
            if (window.hh3dLogBuffer.length > HH3D_LOG_BUFFER_MAX) window.hh3dLogBuffer.shift();
            // Nếu tab Log đang mở thì cập nhật live
            const logList = document.getElementById('hh3d-log-list');
            if (logList) _hh3dRenderLogLine(logList, window.hh3dLogBuffer[window.hh3dLogBuffer.length - 1], true);
        }

        function _hh3dRenderLogLine(container, entry, prepend = false) {
            const colors = { success: '#4caf50', warn: '#ff9800', error: '#f44336', info: '#63b3ed', debug: '#9ca3af' };
            const timeStr = new Date(entry.time).toLocaleTimeString('vi-VN');
            const div = document.createElement('div');
            div.style.cssText = `padding:3px 6px;border-bottom:1px solid rgba(255,255,255,0.05);font-size:11px;font-family:monospace;color:${colors[entry.type] || '#ccc'};word-break:break-all`;
            div.textContent = `[${timeStr}] ${entry.message}`;
            if (prepend) container.insertBefore(div, container.firstChild);
            else container.appendChild(div);
        }

        // Intercept console.*
        (function() {
            const _orig = { log: console.log, warn: console.warn, error: console.error };
            console.log = function(...args) { _orig.log.apply(console, args); hh3dPushLog(args.join(' '), 'debug'); };
            console.warn = function(...args) { _orig.warn.apply(console, args); hh3dPushLog(args.join(' '), 'warn'); };
            console.error = function(...args) { _orig.error.apply(console, args); hh3dPushLog(args.join(' '), 'error'); };
        })();

        function showNotification(message, type = 'success', duration = 3000) {
            hh3dPushLog(message, type);

            // --- Bắt đầu phần chèn CSS tự động ---
            if (!isCssInjected) {
                const style = document.createElement('style');
                style.type = 'text/css';
                style.innerHTML = `
                    #hh3d-notification-container {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 10px;
                    z-index: 1000000;
                    pointer-events: none;
                    }

                    .hh3d-notification-item {
                    padding: 10px 20px;
                    border-radius: 5px;
                    color: white;
                    min-width: 250px;
                    max-width: 350px;
                    pointer-events: auto;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                    transition: all 0.5s ease-in-out;
                    opacity: 0;
                    transform: translateX(100%);
                    background-color: white;
                    }

                    .hh3d-notification-item.success {
                    background-color: #4caf50ff;
                    }
                    .hh3d-notification-item.warn {
                    background-color: #ff9800;
                    }
                    .hh3d-notification-item.error {
                    background-color: #c31004ff;
                    }
                    .hh3d-notification-item.info {
                    background-color: #0066ffff;
                    }
                `;
                document.head.appendChild(style);
                isCssInjected = true;
            }
            // --- Kết thúc phần chèn CSS tự động ---

            // Log console
            const logPrefix = '[HH3D Notification]';
            if (type === 'success') {
                console.log(`${logPrefix} ✅ SUCCESS: ${message}`);
            } else if (type === 'warn') {
                console.warn(`${logPrefix} ⚠️ WARN: ${message}`);
            } else if (type === 'info') {
                console.info(`${logPrefix} ℹ️ INFO: ${message}`);
            } else {
                console.error(`${logPrefix} ❌ ERROR: ${message}`);
            }

            // Tạo container nếu chưa tồn tại
            let container = document.getElementById('hh3d-notification-container');
            if (!container) {
                container = document.createElement('div');
                container.id = 'hh3d-notification-container';
                document.body.appendChild(container);
            }

            // Tạo item thông báo
            const notification = document.createElement('div');
            notification.className = `hh3d-notification-item ${type}`;
            if (/<[a-z][\s\S]*>/i.test(message)) {
                notification.innerHTML = message; // có HTML
            } else {
                notification.innerText = message; // chỉ text
            }

            container.appendChild(notification);

            // Hiển thị thông báo với hiệu ứng trượt vào
            requestAnimationFrame(() => {
                notification.style.opacity = '1';
                notification.style.transform = 'translateX(0)';
            });

            // Tự động ẩn và xóa thông báo
            let timeoutId = setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => notification.remove(), 500);
            }, duration);

            // Cho phép người dùng tương tác
            notification.addEventListener('mouseenter', () => {
                clearTimeout(timeoutId);
            });

            notification.addEventListener('mouseleave', () => {
                timeoutId = setTimeout(() => {
                    notification.style.opacity = '0';
                    notification.style.transform = 'translateX(100%)';
                    setTimeout(() => notification.remove(), 500);
                }, 500);
            });

            notification.addEventListener('click', () => {
                clearTimeout(timeoutId);
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => notification.remove(), 500);
            });
        };

        // ===============================================
        // Class quản lý các quy tắc CSS
        // ===============================================
        class UIMenuStyles {
        addStyles() {
            const style = document.createElement('style');
            style.innerHTML = `
                /* Kiểu chung cho toàn bộ menu */
                .custom-script-menu {
                    display: flex !important;
                    flex-direction: column !important;
                    position: absolute;
                    background-color: #242323ff;
                    min-width: 350px !important;
                    z-index: 1001;
                    border-radius: 5px;
                    top: calc(100% + 6px);
                    right: 0;
                    padding: 8px;
                    gap: 6px;
                }

                /* Kiểu chung cho các nhóm nút */
                .custom-script-menu-group {
                    display: flex;
                    flex-direction: row;
                    gap: 6px;
                    flex-wrap: wrap;
                    justify-content: flex-start;
                }

                /* Kiểu chung cho tất cả các nút (a, button) */
                .custom-script-menu-button,
                .custom-script-menu-link {
                    color: black;
                    padding: 8px 10px !important;
                    font-size: 13px !important;
                    text-decoration: none;
                    border-radius: 5px;
                    background-color: #f1f1f1;
                    flex-grow: 1;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s ease-in-out;
                }
                .custom-script-menu.hidden {
                    visibility: hidden;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.2s ease;
                }

                .custom-script-menu-button:hover,
                .custom-script-menu-link:hover {
                    box-shadow: 0 0 15px rgba(0, 0, 0, 0.7);
                    transform: scale(1.03);
                }

                /* Nút auto-btn */
                .custom-script-auto-btn {
                    background-color: #3498db;
                    color: white;
                    font-weight: bold;
                }
                .custom-script-auto-btn:hover {
                    background-color: #2980b9;
                }
                .custom-script-auto-btn:disabled {
                    background-color: #7f8c8d;
                    cursor: not-allowed;
                    box-shadow: none;
                }


            /* Phúc lợi*/

/* Phúc Lợi */
.custom-script-phuc-loi-group {
    display:flex;
    flex-direction:row;
    gap:6px;
    width:100%;
}

.custom-script-phuc-loi-btn,
.custom-script-phuc-loi-icon-btn {
    border-radius: 5px;
    border: none;
    font-weight: bold;
    display: flex;
    justify-content: center;
    align-items: center;
}

/* Nút chính Phúc Lợi */
.custom-script-phuc-loi-btn {
    flex-grow:1;
    display:flex;
    justify-content:center;
    align-items:center;
    padding:8px 10px;
    font-size:13px;
    border-radius:5px;
    border:none;
    background-color:#3498db;
    color:white;
}


.custom-script-phuc-loi-btn:hover {
    background-color: #3498db;
}

.custom-script-phuc-loi-btn:disabled {
    background-color: #7f8c8d;
    cursor: not-allowed;
    box-shadow: none;
}

/* Nút Bonus (icon) */
.custom-script-phuc-loi-icon-btn {
    width: 30px;
    height: 30px;
    background-color: #555;
    color: white;
    border-radius: 15px;
    margin-top: 5px;
}

.custom-script-phuc-loi-icon-btn:hover {
    background-color: #1f6da1ff;
}








                /* Nhóm Dice Roll */
                .custom-script-dice-roll-group {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    flex-grow: 1;
                }
                .custom-script-dice-roll-select {
                    padding: 8px 10px;
                    font-size: 13px;
                    border-radius: 5px;
                    border: 1px solid #ccc;
                    background-color: #fff;
                    color: black;
                    cursor: pointer;
                    flex-grow: 1;
                }
                .custom-script-dice-roll-btn {
                    background-color: #e74c3c;
                    color: white;
                    font-weight: bold;
                    padding: 8px 10px;
                }
                .custom-script-dice-roll-btn:hover {
                    background-color: #c0392b;
                }
                .custom-script-dice-roll-btn:disabled {
                    background-color: #7f8c8d;
                    cursor: not-allowed;
                    box-shadow: none;
                }
                .custom-script-menu-group-dice-roll {
                    display: flex;
                    flex-direction: row;
                    gap: 6px;
                    flex-wrap: wrap;
                    justify-content: flex-start;
                    align-items: center;
                }

                /* Nhóm Hoang Vực */
                .custom-script-hoang-vuc-group {
                    display: flex;
                    flex-direction: row;
                    gap: 6px;
                }
                .custom-script-hoang-vuc-btn,
                .custom-script-hoang-vuc-settings-btn {
                    border-radius: 5px;
                    border: none;
                    font-weight: bold;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .custom-script-hoang-vuc-btn {
                    background-color: #3498db;
                    color: white;
                }
                .custom-script-hoang-vuc-btn:hover {
                    background-color: #3498db;
                }
                .custom-script-hoang-vuc-btn:disabled {
                    background-color: #7f8c8d;
                    cursor: not-allowed;
                    box-shadow: none;
                }
                .custom-script-hoang-vuc-settings-btn {
                    width: 30px;
                    height: 30px;
                    background-color: #555;
                    color: white;
                    border-radius: 15px;
                    margin-top: 5px;

                }
                .custom-script-hoang-vuc-settings-btn:hover {
                    background-color: #1f6da1ff;
                }


    /* Bí cảnh*/
    /* Wrapper ép Bí Cảnh xuống hàng riêng */
            .custom-script-menu-group .bicanh-wrapper {
                flex-basis: 100%;
                display: block;
                margin-top: 2px;
            }

            /* Container hàng ngang cho các nút bên trong */
            .bicanh-row {
                display: flex;
                gap: 6px;
                align-items: stretch; /* ép các phần tử cao bằng nhau */
            }

            .bicanh-input {
                width: 60px;
                text-align: center;
                box-sizing: border-box;

            }

            .bicanh-socket {
                width: 40px;
                min-width: 0;
                padding: 0;
                margin: 0;
                text-align: center;
                box-sizing: border-box;

            }

        /* Khoáng Mạch */
        .custom-script-khoang-mach-container {
            display: flex;
            flex-direction: column;
            gap: 6px;
            width: 100%;
        }

        .custom-script-khoang-mach-button-row {
            display: flex;
            flex-direction: row;
            gap: 6px;
            width: 100%;
        }

        .custom-script-khoang-mach-button {
            padding: 8px 10px !important;
            font-size: 13px !important;
            text-decoration: none;
            border-radius: 5px;
            background-color: #3498db;
            color: white;
            font-weight: bold;
            flex-grow: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            border: none;
            cursor: pointer;
            transition: all 0.2s ease-in-out;
        }
        .custom-script-khoang-mach-button:disabled {
            background-color: #7f8c8d;
            cursor: not-allowed;
            box-shadow: none;
        }
        .custom-script-settings-panel {
            background-color: #333;
            border: 1px solid #444;
            border-radius: 5px;
            padding: 8px;
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .custom-script-khoang-mach-config-group {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }

        .custom-script-khoang-mach-config-group label {
            font-size: 13px;
            color: #ccc;
            font-weight: bold;
        }

        .custom-script-khoang-mach-config-group select {
            padding: 8px;
        }

        .custom-script-khoang-mach-config-group.checkbox-group {
            flex-direction: row;
            align-items: center;
            gap: 6px;
        }

        .custom-script-khoang-mach-config-group.checkbox-group input[type="checkbox"] {
            width: 16px;
            height: 16px;
        }
        .custom-script-khoang-mach-config-group.number-input-group {
            flex-direction: row;
            align-items: center;
            gap: 6px;
        }

        .custom-script-hoat-dong-ngay-btn{
            background-color: #0969b8;
            color: #fff;
            font-weight: bold;
        }
        .custom-script-hoat-dong-ngay-btn:hover {
            background-color: #2100df;
        }
        .custom-script-hoat-dong-ngay-btn:disabled {
            background-color: #939797;
            cursor: not-allowed;
            box-shadow: none;
        }


    /* Nút Tặng Hoa */
        .custom-script-tang-hoa-btn {
            // background-color: #e91e63; /* hồng */
            background-color: #CC3078;
            color: #fff;
            font-weight: bold;
        }
        .custom-script-tang-hoa-btn:hover {
            background-color: #c2185b; /* hồng đậm khi hover */
        }
        .custom-script-tang-hoa-btn:disabled {
            background-color: #7f8c8d;
            cursor: not-allowed;
            box-shadow: none;
        }

        /* Dropdown số người Tặng Hoa */
        .custom-script-tang-hoa-select {
            color: #000;
            //border: 1px solid #d81b60;
            border-radius: 5px;
            padding: 6px 10px;
            //font-weight: bold;
            cursor: pointer;
        }

    /* Nút Mua Rương Linh Bảo */
        .custom-script-mua-ruong-btn {
            background-color: #009688; /* xanh ngọc */
            color: #fff;
            font-weight: bold;
        }
        .custom-script-mua-ruong-btn:hover {
            background-color: #00796b; /* xanh ngọc đậm khi hover */
        }
        .custom-script-mua-ruong-btn:disabled {
            background-color: #7f8c8d; /* xám khi disable */
            cursor: not-allowed;
            box-shadow: none;
        }

        /* Dropdown số lượng Mua Rương */
        .custom-script-mua-ruong-select {
            color: black;
            //border: 1px solid #009688; /* viền xanh ngọc */
            border-radius: 5px;
            padding: 6px 10px;
            //font-weight: bold;
            cursor: pointer;
        }

        .custom-script-mua-ruong-select:hover {
        // color: #004d40;            /* chữ xanh đậm hơn khi hover */
            color: #000;
        }


    /* Nút KHẮC TRẬN VĂN*/
        .custom-script-khac-tran-van-btn {
            background-color: #7B68EE;
            color: #fff;
            font-weight: bold;
        }
        .custom-script-khac-tran-van-btn:hover {
            background-color: #6A5ACD;}

        .custom-script-khac-tran-van-btn:disabled {
            background-color: #7f8c8d; /* xám khi disable */
            cursor: not-allowed;
            box-shadow: none;
        }

    /* Nút KHẮC TRẬN VĂN lượt nhận vip*/
        .custom-script-khac-tran-van-vip-btn {
            // background-color: #FF8C00;
            background-color: #7B68EE;
            color: #fff;
            font-weight: bold;
        }
        .custom-script-khac-tran-van-vip-btn:hover {
            background-color: #6A5ACD;}

        .custom-script-khac-tran-van-vip-btn:disabled {
            background-color: #7f8c8d; /* xám khi disable */
            cursor: not-allowed;
            box-shadow: none;
        }

    /* Nút Cầu Nguyện tiên duyên*/
        .custom-script-cau-nguyen-btn {
            // background-color: #FF8C00;
            background-color:  #CC3078;
            color: #fff;
            font-weight: bold;
        }
        .custom-script-cau-nguyen-btn:hover {
            background-color: #c2185b;}

        .custom-script-cau-nguyen-btn:disabled {
            background-color: #7f8c8d; /* xám khi disable */
            cursor: not-allowed;
            box-shadow: none;
        }
        // .custom-script-cau-nguyen-btn.outline-state {
        // background-color: #7f8c8d; /* nền trong suốt */
        // border: 1px solid #666;        /* viền màu xám hoặc màu bạn chọn */
        // opacity: 0.8;                  /* hơi mờ để phân biệt */
        // }



    /*Mua Đan*/
    /* Container chính */
        .custom-script-mua-dan-container {
            display: flex;
            flex-direction: column;
            gap: 6px;
            width: 100%;
        }

        /* Hàng chính: Mua Đan + gear */
        .custom-script-mua-dan-button-row {
            display: flex;
            flex-direction: row;
            gap: 6px;
            width: 100%;
        }

        /* Nút chính Mua Đan */
        .custom-script-mua-dan-button {
            padding: 8px 10px;
            font-size: 13px;
            border-radius: 5px;
            background-color: #0a3d66ff;
            color: #fff;
            font-weight: bold;
            flex-grow: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            border: none;
            cursor: pointer;
            transition: background-color 0.2s ease-in-out;
        }
        .custom-script-mua-dan-button:disabled {
            background-color: #7f8c8d;
            cursor: not-allowed;
        }

        /* Nút gear ⚙️ giống Khoáng Mạch */
        .custom-script-mua-dan-settings-btn {
            width: 30px;
            height: 30px;
            background-color: #555;
            color: #fff;
            border-radius: 15px;
            margin-top: 5px;
            border: none;
            font-weight: bold;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
        }
        .custom-script-mua-dan-settings-btn:hover {
            background-color: #1f6da1ff;
        }

        /* Panel xổ xuống */
        .custom-script-mua-dan-settings-panel {
            background-color: #444;
            border: 1px solid #444;
            border-radius: 5px;
            padding: 5px;
            display: flex;
            flex-direction: column;
            gap: 5px;
        }

        /* Hàng trong panel */
        .custom-script-mua-dan-config-row {
            display: flex;
            align-items: center;
            gap: 5px; /* khoảng cách giữa dropdown + button*/
            //margin-bottom: 10px; //khoảng cách giữa 2 dòng trong menu
        }

        .custom-script-mua-dan-config-row:last-child {
            margin-bottom: 0; /* bỏ margin ở hàng cuối */
        }

        /* Dropdown */
        .custom-script-mua-dan-config-row select {
            padding: 4px 8px;       /* giảm padding cho gọn */
            font-size: 13px;
            background-color: #fff;
            color: #000;
            border: 1px solid #ccc;
            border-radius: 4px;
            line-height: 1.4;
            box-sizing: border-box;
            height: 30px;
            width: auto;            /* co theo nội dung */
            white-space: nowrap;    /* không cho chữ xuống hàng */
        }
        /* Nút hành động */
        .custom-script-mua-dan-action-btn {
            height: 30px;
            padding: 4px 10px;      /* giảm padding cho gọn */
            font-size: 13px;
            border-radius: 4px;
            border: none;
            cursor: pointer;
            box-sizing: border-box;
            display: flex;
            justify-content: center;
            align-items: center;
            line-height: 1.4;
            width: auto;            /* co theo nội dung */
            white-space: nowrap;    /* không cho chữ xuống hàng */
        }

        /* Màu riêng từng nút */
        .custom-script-mua-dan-tong-btn {
            background-color: #f1c40f; /* xanh ngọc */
            color: #000;
        }
        .custom-script-mua-dan-tubao-btn {
            background-color: #f1c40f; /* vàng */
            color: #000;
        }

        .custom-script-mua-dan-action-btn:disabled {
            background-color: #7f8c8d; /* màu xám */
            color: #ccc;
            cursor: not-allowed;
        }

        #checkbox-tubao {
            width:18px;          /* tăng kích thước */
            height: 18px;
            accent-color: #068202ff;
            cursor: pointer;
            margin-left: 2px;
        }

        #checkbox-tubao:hover {
            outline: 2px solid #f1c40f; /* viền vàng khi hover */
            border-radius: 4px;
        }


    /* Hiệu ứng cho nút tìm kiếm */
                @keyframes searchIconToggle {
                    0%, 49.9% {
                        content: '🔍';
                    }
                    50%, 100% {
                        content: '🔎';
                    }
                }

                .custom-script-hoang-vuc-settings-btn.searching {
                    animation: searchIconToggle 1s infinite;
                }

                .custom-script-status-icon {
                    width: 10px;
                    height: 10px;
                    margin-top: 0px;
                    margin-right: 0px;
                }

                .custom-script-item-wrapper {
                    position: relative; /* Quan trọng: Đặt vị trí tương đối để định vị icon */
                }

                /* Biểu tượng trạng thái Autorun */
                .custom-script-status-icon {
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    width: 10px;
                    height: 10px;
                    background-color: transparent;
                    border-radius: 50%;
                    border: none;
                    z-index: 10;
                }

                /* Khi autorun đang chạy */
                .custom-script-status-icon.running {
                    background-color: #e74c3c; /* Màu đỏ */
                    animation: pulse 1.5s infinite; /* Hiệu ứng nhấp nháy */
                }

                /* Hiệu ứng nhấp nháy */
                @keyframes pulse {
                    0% {
                        transform: scale(1);
                        opacity: 1;
                    }
                    50% {
                        transform: scale(1.5);
                        opacity: 0.5;
                    }
                    100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }

                /* CSS cho container chứa nhiều thông báo */
                .custom-script-status-bar {
                    position: relative;
                    bottom: 0px;           /* ✅ bám đáy parent thay vì top */
                    left: 50%;
                    transform: translateX(-50%);
                    width: 100%;
                    max-width: 250px;
                    padding: 5px;
                    display: flex;
                    flex-direction: column; /* thông báo mới nằm trên */
                    gap: 5px;
                    z-index: 1000;
                }

                /* CSS cho từng thông báo riêng lẻ */
                .custom-script-message {
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 11px;
                    font-weight: 500;
                    color: #fff;
                    white-space: nowrap;
                    text-align: center;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                    opacity: 0;
                    animation: fadeIn 0.3s forwards;
                    transition: opacity 0.3s ease-in-out;
                }

                /* Các loại thông báo */
                .custom-script-message.info {
                    background-color: #3498db;
                }

                .custom-script-message.success {
                    background-color: #2ecc71;
                }


                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
    }

                /* Xu Info Styles - Compact Version */
                #xu-info.xu-info-container {
                    display: block !important;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(245, 197, 66, 0.2);
                    border-radius: 8px;
                    padding: 8px 10px !important;
                    margin-bottom: 8px;
                    position: relative;
                    overflow: hidden;
                    width: 100%;
                    box-sizing: border-box;
                    font-size: 12px;
                }

                #xu-info.xu-info-container:before {
                    content: "";
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 2px;
                    background: linear-gradient(90deg, #22d3a0, #10b981, #0ea5e9);
                }

                .xu-display {
                    display: flex !important;
                    align-items: center;
                    justify-content: space-between;
                    gap: 6px;
                    font-size: 11px;
                    color: #d0d8f0;
                }

                .xu-display .xu-left {
                    flex-shrink: 0;
                    padding: 4px 10px;
                    border: 1px solid rgba(122, 162, 247, 0.25);
                    border-radius: 8px;
                    background: linear-gradient(135deg, rgba(26, 27, 46, 0.6), rgba(40, 42, 68, 0.4));
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.04);
                }

                .xu-display .xu-right {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .xu-display strong {
                    color: #f5c542;
                    font-weight: 700;
                    font-size: 12px;
                }

                .autorun-main-btn {
                    display: inline-block !important;
                    width: auto;
                    min-width: 100px;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    border: 1px solid rgba(102, 126, 234, 0.3);
                    color: #fff;
                    padding: 4px 12px !important;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 10px;
                    font-weight: 600;
                    transition: all 0.2s;
                    text-align: center;
                    margin-top: 4px;
                    text-transform: uppercase;
                    letter-spacing: 0.3px;
                }

                .autorun-main-btn:hover {
                    background: linear-gradient(135deg, #764ba2, #667eea);
                    border-color: #667eea;
                    box-shadow: 0 0 12px rgba(102, 126, 234, 0.5);
                    transform: translateY(-1px);
                }

                .autorun-main-btn.running {
                    background: linear-gradient(135deg, #f44336, #e91e63);
                    border-color: rgba(244, 67, 54, 0.3);
                    animation: pulse 1.5s infinite;
                }

                @keyframes pulse {
                    0%, 100% { box-shadow: 0 0 8px rgba(244, 67, 54, 0.4); }
                    50% { box-shadow: 0 0 16px rgba(244, 67, 54, 0.8); }
                }

                .xu-display .autorun-indicator-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    flex-shrink: 0;
                    transition: all 0.3s;
                }

                .xu-display .autorun-indicator-dot.enabled {
                    background: #22d3a0;
                    box-shadow: 0 0 6px rgba(34, 211, 160, 0.6);
                }

                .xu-display .autorun-indicator-dot.disabled {
                    background: #e74c3c;
                    box-shadow: 0 0 6px rgba(231, 76, 60, 0.6);
                }

                .xu-display .autorun-icon {
                    font-size: 16px;
                    cursor: pointer;
                    transition: all 0.2s;
                    flex-shrink: 0;
                    user-select: none;
                }

                .xu-display .autorun-icon:hover {
                    transform: scale(1.2);
                    filter: drop-shadow(0 0 4px rgba(245, 197, 66, 0.8));
                }
                .xu-display .autorun-icon.enabled {
                    color: #22d3a0;
                }
                .xu-display .autorun-icon.disabled {
                    color: #e74c3c;
                }

                .xu-display #profile-refresh-btn {
                    padding: 3px 6px;
                    font-size: 11px;
                    border-radius: 4px;
                    background: rgba(76, 175, 80, 0.8);
                    color: #fff;
                    border: none;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.2s;
                    white-space: nowrap;
                }

                .xu-display #profile-refresh-btn:hover {
                    background: #4caf50;
                    transform: scale(1.05);
                }

                .xu-display #profile-refresh-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .promo-form {
                    display: flex !important;
                    gap: 6px;
                    align-items: center;
                    margin-top: 8px;
                }

                .promo-form input {
                    flex: 1;
                    padding: 4px 8px;
                    font-size: 11px;
                    border-radius: 4px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    background: rgba(255, 255, 255, 0.05);
                    color: #fff;
                    outline: none;
                    transition: all 0.2s;
                }

                .promo-form input:focus {
                    border-color: #f5c542;
                    background: rgba(255, 255, 255, 0.08);
                }

                .promo-form button {
                    padding: 4px 10px;
                    font-size: 11px;
                    border-radius: 4px;
                    background: linear-gradient(135deg, #f5c542, #fb923c);
                    color: #000;
                    border: none;
                    cursor: pointer;
                    font-weight: 600;
                    white-space: nowrap;
                    transition: all 0.2s;
                }

                .promo-form button.settings-btn {
                    padding: 4px 10px;
                    font-size: 11px;
                    border-radius: 4px;
                    background: linear-gradient(135deg, #333a47, #658586);
                    color: #000;
                    border: none;
                    cursor: pointer;
                    font-weight: 600;
                    white-space: nowrap;
                    transition: all 0.2s;
                }

                .promo-form button:hover {
                    transform: scale(1.05);
                    box-shadow: 0 0 12px rgba(245, 197, 66, 0.4);
                }

                .promo-form button.settings-btn:hover {
                    transform: scale(1.05);
                    box-shadow: 0 0 12px rgba(245, 197, 66, 0.4);
                }

                /* Progress Overview Styles */
                #reward-progress-wrap {
                    font-size: 12px;
                }

                #reward-progress-wrap .nv-overview {
                    display: block !important;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(245, 197, 66, 0.2);
                    border-radius: 8px;
                    padding: 10px 12px !important;
                    margin-bottom: 8px;
                    position: relative;
                    overflow: hidden;
                    width: 100%;
                    box-sizing: border-box;
                }

                #reward-progress-wrap .nv-overview:before {
                    content: "";
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 2px;
                    background: linear-gradient(90deg, #f5c542, #fb923c, #f472b6);
                }

                #reward-progress-wrap .nv-ov-header {
                    display: flex !important;
                    flex-direction: row !important;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 6px;
                    width: 100%;
                    gap: 0 !important;
                }

                #reward-progress-wrap .nv-ov-header h3 {
                    margin: 0 !important;
                    font-size: 13px;
                    font-weight: 700;
                    color: #e0e6f0;
                    flex: 1;
                }

                #reward-progress-wrap .nv-ov-header .percent {
                    font-size: 13px;
                    font-weight: 800;
                    color: #f5c542;
                    flex-shrink: 0;
                }

                #reward-progress-wrap .nv-ov-header .percent.full {
                    color: #22d3a0;
                }

                #reward-progress-wrap .nv-progress-bar {
                    display: block !important;
                    width: 100% !important;
                    height: 8px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                    overflow: hidden;
                    margin-bottom: 6px;
                }

                #reward-progress-wrap .nv-progress-fill {
                    display: block !important;
                    height: 100%;
                    background: linear-gradient(90deg, #f5c542, #fb923c);
                    border-radius: 10px;
                    transition: width 0.7s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 0 8px rgba(245, 197, 66, 0.5);
                }

                #reward-progress-wrap .nv-progress-fill.full {
                    background: linear-gradient(90deg, #22d3a0, #10b981);
                    box-shadow: 0 0 8px rgba(34, 211, 160, 0.6);
                }

                #reward-progress-wrap .nv-ov-summary {
                    display: block !important;
                    margin: 0 0 6px !important;
                    font-size: 11px;
                    color: #9ca3af;
                    width: 100%;
                }

                #reward-progress-wrap .nv-chips {
                    display: flex !important;
                    flex-direction: row !important;
                    flex-wrap: wrap;
                    gap: 4px;
                    width: 100%;
                    margin-bottom: 4px;
                }

                #reward-progress-wrap .nv-chip {
                    display: inline-block !important;
                    font-size: 10px;
                    padding: 2px 6px !important;
                    border-radius: 10px;
                    font-weight: 600;
                    white-space: nowrap;
                    flex-grow: 0 !important;
                }

                #reward-progress-wrap .nv-chip.chip-done {
                    background: rgba(34, 211, 160, 0.12);
                    color: #22d3a0;
                    border: 1px solid rgba(34, 211, 160, 0.2);
                }

                #reward-progress-wrap .nv-chip.chip-pend {
                    background: rgba(90, 99, 122, 0.12);
                    color: #6b7280;
                    border: 1px solid rgba(90, 99, 122, 0.15);
                }

                #reward-progress-wrap .progress-toggle-btn {
                    display: block !important;
                    width: 100%;
                    background: rgba(245, 197, 66, 0.1);
                    border: 1px solid rgba(245, 197, 66, 0.3);
                    color: #f5c542;
                    padding: 4px 8px !important;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 10px;
                    font-weight: 600;
                    transition: all 0.2s;
                    margin-top: 4px;
                    text-align: center;
                }

                #reward-progress-wrap .progress-toggle-btn:hover {
                    background: rgba(245, 197, 66, 0.2);
                    border-color: #f5c542;
                }

                #reward-progress-wrap .nv-quest-details {
                    display: none !important;
                    margin-top: 8px;
                    padding-top: 8px;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                    width: 100%;
                }

                #reward-progress-wrap .nv-quest-details.show {
                    display: block !important;
                }

                #reward-progress-wrap .nv-quest-item {
                    display: flex !important;
                    flex-direction: row !important;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 8px !important;
                    margin-bottom: 4px;
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 6px;
                    font-size: 11px;
                    width: 100%;
                    box-sizing: border-box;
                }

                #reward-progress-wrap .nv-quest-item.done {
                    background: rgba(34, 211, 160, 0.12);
                    color: #22d3a0;
                    border: 1px solid rgba(34, 211, 160, 0.2);
                }

                #reward-progress-wrap .nv-quest-icon {
                    font-size: 16px;
                    width: 20px;
                    text-align: center;
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                #reward-progress-wrap .nv-quest-icon i {
                    font-size: 14px;
                }

                #reward-progress-wrap .nv-quest-name {
                    flex: 1;
                    color: #d0d8f0;
                }

                #reward-progress-wrap .nv-quest-status {
                    font-size: 10px;
                    padding: 2px 6px;
                    border-radius: 8px;
                    font-weight: 600;
                    flex-shrink: 0;
                    white-space: nowrap;
                }

                #reward-progress-wrap .nv-quest-status.done {
                    background: rgba(34, 211, 160, 0.15);
                    color: #22d3a0;
                }

                #reward-progress-wrap .nv-quest-status.pending {
                    background: rgba(90, 99, 122, 0.15);
                    color: #9ca3af;
                }

                /* Footer Copyright */
                .custom-script-footer {
                    text-align: center;
                    padding: 8px 10px;
                    margin-top: 6px;
                    font-size: 11px;
                    color: #888;
                    border-top: 1px solid #444;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 5px;
                }

                .custom-script-footer-heart {
                    color: #e74c3c;
                    font-size: 13px;
                    animation: heartbeat 1.5s ease-in-out infinite;
                }

                @keyframes heartbeat {
                    0%, 100% { transform: scale(1); }
                    10%, 30% { transform: scale(1.1); }
                    20%, 40% { transform: scale(1); }
                }

                .custom-script-footer-guild {
                    background: linear-gradient(135deg, #f39c12, #e67e22);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    font-weight: bold;
                    font-size: 14px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    filter: drop-shadow(0 0 8px rgba(243, 156, 18, 0.6));
                    animation: guildGlow 2s ease-in-out infinite;
                }

                @keyframes guildGlow {
                    0%, 100% { filter: drop-shadow(0 0 8px rgba(243, 156, 18, 0.6)); }
                    50% { filter: drop-shadow(0 0 12px rgba(243, 156, 18, 0.9)); }
                }

                .custom-script-footer-text {
                    color: #aaa;
                }

                .custom-script-footer-name {
                    color: #3498db;
                    font-weight: bold;
                    font-size: 12px;
                }

                /* ===== Quest Controls Styles ===== */
                .quest-controls {
                    display: flex;
                    gap: 4px;
                    align-items: center;
                    flex-wrap: nowrap;
                }

                .quest-action-btn,
                .quest-extra-btn {
                    padding: 4px 8px;
                    font-size: 11px;
                    border-radius: 4px;
                    border: none;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.2s;
                    white-space: nowrap;
                }

                .quest-action-btn {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    min-width: 70px;
                }

                .quest-action-btn:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
                }

                .quest-action-btn:disabled {
                    background: #555;
                    cursor: not-allowed;
                    opacity: 0.6;
                    color: #22d3a0;
                }

                .quest-extra-btn {
                    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                    color: white;
                    min-width: 32px;
                }

                .quest-extra-btn:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 2px 8px rgba(245, 87, 108, 0.4);
                }

                .quest-select {
                    padding: 3px 6px;
                    font-size: 10px;
                    border-radius: 4px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    background: rgba(255, 255, 255, 0.05);
                    color: #d0d8f0;
                    cursor: pointer;
                    max-width: 80px;
                }

                .quest-select:focus {
                    outline: none;
                    border-color: #667eea;
                }

                .quest-input {
                    padding: 3px 6px;
                    font-size: 10px;
                    border-radius: 4px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    background: rgba(255, 255, 255, 0.05);
                    color: #d0d8f0;
                    width: 45px;
                    text-align: center;
                }

                .quest-input:focus {
                    outline: none;
                    border-color: #667eea;
                }

                .quest-toggle {
                    padding: 4px 8px;
                    font-size: 14px;
                    border-radius: 4px;
                    border: none;
                    background: rgba(255, 255, 255, 0.05);
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .quest-toggle:hover {
                    background: rgba(255, 255, 255, 0.1);
                    transform: scale(1.1);
                }

                .quest-settings-btn {
                    padding: 4px 8px;
                    font-size: 12px;
                    border-radius: 4px;
                    border: none;
                    background: rgba(255, 255, 255, 0.05);
                    color: #9ca3af;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .quest-settings-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: #d0d8f0;
                    transform: rotate(45deg);
                }

                /* Quest Autorun Indicator Dot */
                .quest-autorun-indicator {
                    position: absolute;
                    top: 4px;
                    left: 4px;
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    z-index: 10;
                    box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
                    transition: all 0.3s ease;
                }

                .quest-autorun-indicator.enabled {
                    background: #22d3a0;
                    box-shadow: 0 0 6px rgba(34, 211, 160, 0.6);
                }

                .quest-autorun-indicator.disabled {
                    background: #e74c3c;
                    box-shadow: 0 0 6px rgba(231, 76, 60, 0.6);
                }

                /* Quest item với indicator - cần relative position */
                .nv-quest-item {
                    position: relative;
                }

                /* Next run time - nổi ở bottom-right của nhiệm vụ */
                .quest-next-time {
                    display: none;
                    position: absolute;
                    bottom: -1px;
                    left: 30%;
                    transform: translateX(-50%);
                    font-size: 9px;
                    color: #7aa2f7;
                    background: transparent;
                    padding: 1px 5px;
                    border-radius: 4px 4px 0 0;
                    opacity: 0.9;
                    pointer-events: none;
                    white-space: nowrap;
                    z-index: 5;
                }
                .quest-next-time.active {
                    display: block;
                }

                .quest-next-time[data-task="restart"] {
                    position: static !important;
                    bottom: auto !important;
                    left: auto !important;
                    transform: none !important;
                    display: none;
                }
                .quest-next-time[data-task="restart"].active {
                    display: inline !important;
                }

                /* Hover effect cho icon khi có thể toggle */
                .nv-quest-icon[data-task] {
                    transition: all 0.2s ease;
                }

                .nv-quest-icon[data-task]:hover {
                    transform: scale(1.15);
                    filter: brightness(1.2);
                }

                /* Responsive adjustments */
                @media (max-width: 400px) {
                    .quest-controls {
                        flex-wrap: wrap;
                    }
                    .quest-action-btn {
                        min-width: 60px;
                        font-size: 10px;
                    }
                }
                
                /* =============================================== */
                /* UNIFIED SETTINGS MODAL STYLES */
                /* =============================================== */
                .settings-modal {
                    display: none;
                    position: fixed;
                    z-index: 999999;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.7);
                    justify-content: center;
                    align-items: center;
                    animation: fadeIn 0.3s ease;
                }
                
                .settings-modal-content {
                    background: linear-gradient(135deg, #1e1e2e 0%, #2a2a3e 100%);
                    border-radius: 10px;
                    width: 92%;
                    max-width: 520px;
                    max-height: 80vh;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
                    animation: slideIn 0.2s ease;
                }
                
                .settings-modal-header {
                    padding: 10px 14px;
                    border-bottom: 1px solid #3a3a4e;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .settings-modal-header h2 {
                    margin: 0;
                    color: #fff;
                    font-size: 15px;
                    font-weight: 600;
                }
                
                .settings-close-btn {
                    background: transparent;
                    border: none;
                    color: #888;
                    font-size: 22px;
                    cursor: pointer;
                    transition: color 0.2s;
                    line-height: 1;
                    padding: 0;
                    width: 24px;
                    height: 24px;
                }
                
                .settings-close-btn:hover {
                    color: #ff5555;
                }
                
                .settings-tabs-container {
                    display: flex;
                    gap: 4px;
                    padding: 7px 10px;
                    background: #16161e;
                    overflow-x: auto;
                    border-bottom: 1px solid #3a3a4e;
                    scrollbar-width: thin;
                    scrollbar-color: #4a4a6e #16161e;
                }
                
                .settings-tabs-container::-webkit-scrollbar {
                    height: 4px;
                }
                
                .settings-tabs-container::-webkit-scrollbar-track {
                    background: #16161e;
                }
                
                .settings-tabs-container::-webkit-scrollbar-thumb {
                    background: #4a4a6e;
                    border-radius: 3px;
                }
                
                .settings-tabs-container::-webkit-scrollbar-thumb:hover {
                    background: #5a5a7e;
                }
                
                .settings-tab {
                    padding: 5px 10px;
                    background: #2a2a3e;
                    border: none;
                    border-radius: 5px;
                    color: #aaa;
                    cursor: pointer;
                    white-space: nowrap;
                    transition: all 0.15s;
                    font-size: 12px;
                    font-weight: 500;
                }
                
                .settings-tab:hover {
                    background: #3a3a4e;
                    color: #fff;
                }
                
                .settings-tab.active {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: #fff;
                    box-shadow: 0 1px 6px rgba(102, 126, 234, 0.4);
                }
                
                .settings-content-container {
                    flex: 1;
                    overflow-y: auto;
                    padding: 10px 12px;
                    scrollbar-width: thin;
                    scrollbar-color: #4a4a6e #1e1e2e;
                }
                
                .settings-content-container::-webkit-scrollbar {
                    width: 5px;
                }
                
                .settings-content-container::-webkit-scrollbar-track {
                    background: #1e1e2e;
                }
                
                .settings-content-container::-webkit-scrollbar-thumb {
                    background: #4a4a6e;
                    border-radius: 4px;
                }
                
                .settings-content-container::-webkit-scrollbar-thumb:hover {
                    background: #5a5a7e;
                }
                
                .settings-section {
                    animation: fadeInUp 0.2s ease;
                }
                
                .settings-section h3 {
                    color: #ccc;
                    margin: 0 0 8px 0;
                    font-size: 13px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .settings-option {
                    margin-bottom: 6px;
                    padding: 7px 10px;
                    background: rgba(255, 255, 255, 0.04);
                    border-radius: 6px;
                    transition: background 0.15s;
                }
                
                .settings-option:hover {
                    background: rgba(255, 255, 255, 0.07);
                }
                
                .settings-option label {
                    display: block;
                    color: #ccc;
                    margin-bottom: 4px;
                    font-size: 12px;
                    font-weight: 500;
                }
                
                .settings-checkbox-label {
                    display: flex !important;
                    align-items: center;
                    cursor: pointer;
                    user-select: none;
                    margin-bottom: 0 !important;
                }
                
                .settings-checkbox-label input[type="checkbox"] {
                    margin-right: 7px;
                    width: 14px;
                    height: 14px;
                    cursor: pointer;
                    accent-color: #667eea;
                    flex-shrink: 0;
                }
                
                .settings-checkbox-label span {
                    font-size: 13px;
                    color: #ddd;
                }
                
                .settings-description {
                    margin: 3px 0 0 0;
                    font-size: 11px;
                    color: #777;
                }
                
                .settings-input,
                .settings-select {
                    width: 100%;
                    padding: 5px 8px;
                    background: #16161e;
                    border: 1px solid #3a3a4e;
                    border-radius: 5px;
                    color: #fff;
                    font-size: 12px;
                    transition: border-color 0.2s;
                    margin-top: 3px;
                }
                
                .settings-input-number {
                    padding: 5px 8px;
                    background: #16161e;
                    border: 1px solid #3a3a4e;
                    border-radius: 5px;
                    color: #fff;
                    font-size: 12px;
                }

                .settings-input:focus,
                .settings-select:focus {
                    outline: none;
                    border-color: #667eea;
                    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
                }
                
                .settings-modal-footer {
                    padding: 8px 12px;
                    border-top: 1px solid #3a3a4e;
                    display: flex;
                    justify-content: flex-end;
                }
                
                .settings-save-btn {
                    padding: 7px 18px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: #fff;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 13px;
                    font-weight: 600;
                    transition: transform 0.15s, box-shadow 0.15s;
                }
                
                .settings-save-btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 3px 10px rgba(102, 126, 234, 0.4);
                }
                
                .settings-save-btn:active {
                    transform: translateY(0);
                }

                .general-link-btn {
                    padding: 4px 8px;
                    font-size: 11px;
                    border-radius: 4px;
                    border: 1px solid rgba(255,255,255,0.12);
                    background: rgba(255,255,255,0.06);
                    color: #d0d8f0;
                    cursor: pointer;
                    transition: background 0.15s;
                    white-space: nowrap;
                }
                .general-link-btn:hover {
                    background: rgba(102,126,234,0.25);
                    border-color: #667eea;
                    color: #fff;
                }

                /* Search task item */
                .nv-quest-item.km-search-item {
                    flex-wrap: wrap;
                    align-items: center;
                }
                .km-search-item .nv-quest-name,
                .km-search-item .nv-quest-icon,
                .km-search-item .quest-controls {
                    flex-shrink: 0;
                }
                .km-search-item .nv-quest-name {
                    flex: 1;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                `;

            document.head.appendChild(style);
        }
        }
      
    // ===============================================
    // Class khởi tạo và chèn menu vào DOM
    // ===============================================
        class UIInitializer {
            constructor(selector, linkGroups, accountId) {
                this.selector = selector;
                this.linkGroups = linkGroups;
                this.accountId = accountId;

                this.retryInterval = 500;
                this.timeout = 15000;
                this.elapsedTime = 0;
                this.intervalId = null;
            }

            start() {
                console.log("[HH3D Script] ⏳ Đang tìm kiếm vị trí để chèn menu...");
                this.intervalId = setInterval(() => this.checkAndInsert(), this.retryInterval);
            }

            checkAndInsert() {
                const notificationsDiv = document.querySelector(this.selector);

                if (notificationsDiv) {
                    clearInterval(this.intervalId);
                    console.log("[HH3D Script] ✅ Đã tìm thấy vị trí. Bắt đầu chèn menu.");
                    this.createAndInjectMenu(notificationsDiv);
                } else {
                    this.elapsedTime += this.retryInterval;

                    if (this.elapsedTime >= this.timeout) {
                        clearInterval(this.intervalId);
                        console.error(
                            `[HH3D Script - Lỗi] ❌ Không tìm thấy phần tử "${this.selector}" sau ${
                                this.timeout / 1000
                            } giây.`
                        );
                    }
                }
            }


      createAndInjectMenu(notificationsDiv) {
            const parentNavItems = notificationsDiv.parentNode;

            if (parentNavItems && parentNavItems.classList.contains("nav-items")) {
                if (document.querySelector(".custom-script-item-wrapper")) {
                    console.log("[HH3D Script] ⚠️ Menu đã tồn tại. Bỏ qua việc chèn lại.");
                    return;
                }

                const customMenuWrapper = document.createElement("div");
                customMenuWrapper.classList.add("load-notification", "relative", "custom-script-item-wrapper");

                const newMenuButton = document.createElement("a");
                newMenuButton.href = "#";
                newMenuButton.setAttribute("data-view", "hide");

                // Tạo phần tử div cho biểu tượng trạng thái
                const statusIcon = document.createElement("div");
                statusIcon.classList.add("custom-script-status-icon");
                newMenuButton.appendChild(statusIcon);

                const iconDiv = document.createElement("div");
                const iconSpan = document.createElement("span");
                iconSpan.classList.add("material-icons-round1", "material-icons-menu");
                iconSpan.textContent = "task";
                iconDiv.appendChild(iconSpan);

                const label = document.createElement('span');
                label.classList.add('nav-label');
                label.textContent = 'Auto';
                newMenuButton.appendChild(iconDiv);
                newMenuButton.appendChild(label);

                const dropdownMenu = document.createElement("div");
                dropdownMenu.className = "custom-script-menu hidden";



            /* ===== Khởi tạo Profile UI với Quest Skeleton ===== */
            const infoBox = document.createElement("div");
            infoBox.id = "autoProfileInfo";
            infoBox.style.position = "relative";
            infoBox.innerHTML = `                
                <div id="xu-info" class="xu-info-container"></div>
                <div id="reward-progress-wrap" style="margin-top:6px;">${createQuestSkeletonUI()}</div>
            `;
            dropdownMenu.appendChild(infoBox);
            
            // Gắn sự kiện cho các nút trong quest skeleton
            setTimeout(() => {
                attachQuestButtonHandlers();
                loadHH3DProfile();               
            }, 100);

                // Không còn tạo menu groups vì tất cả đã chuyển vào quest list
                // LINK_GROUPS hiện tại rỗng
                if (this.linkGroups.length > 0) {
                    this.linkGroups.forEach(group => {
                        const groupDiv = document.createElement("div");
                        groupDiv.className = "custom-script-menu-group";
                        dropdownMenu.appendChild(groupDiv);

                        group.links.forEach(link => {
                            if (!link.isAutorun) {
                                const menuItem = document.createElement("a");
                                menuItem.classList.add("custom-script-menu-link");
                                menuItem.href = link.url;
                                menuItem.textContent = link.text;
                                menuItem.target = "_blank";
                                groupDiv.appendChild(menuItem);
                            }
                        });
                    });
                }

                // --- Thanh trạng thái ---
                const statusBar = document.createElement("div");
                statusBar.className = "custom-script-status-bar";
                dropdownMenu.appendChild(statusBar);
                const tongMonName = localStorage.getItem('tm_name');
                // --- Footer Copyright ---
                const footer = document.createElement("div");
                footer.className = "custom-script-footer";
                footer.innerHTML = `
                    <span class="custom-script-footer-guild">${tongMonName}</span>
                    <span class="custom-script-footer-text">ㅤㅤEdited</span>
                    <span class="custom-script-footer-heart">❤</span>
                    <span class="custom-script-footer-text">by</span>
                    <span class="custom-script-footer-name">Krizk</span>
                `;
                dropdownMenu.appendChild(footer);

                customMenuWrapper.appendChild(newMenuButton);
                customMenuWrapper.appendChild(dropdownMenu);
                parentNavItems.insertBefore(customMenuWrapper, notificationsDiv.nextSibling);

                console.log("[HH3D Script] 🎉 Chèn menu tùy chỉnh thành công!");



                newMenuButton.addEventListener("click", e => {
                    e.preventDefault();
                    dropdownMenu.classList.toggle("hidden");
                    iconSpan.textContent = dropdownMenu.classList.contains("hidden") ? "task" : "highlight_off";
                });

                document.addEventListener("click", e => {
                    if (!customMenuWrapper.contains(e.target)) {
                        dropdownMenu.classList.add("hidden");
                        iconSpan.textContent = "task";
                    }
                });
            } else {
                console.warn('[HH3D Script - Cảnh báo] ⚠️ Không tìm thấy phần tử cha ".nav-items". Không thể chèn menu.');
            }
        }

        // Hàm để cập nhật statusbar
        updateStatusBar(message, type = "info", duration = null) {
            const statusBar = document.querySelector(".custom-script-status-bar");
            if (!statusBar) return;

            const messageElement = document.createElement("div");
            messageElement.className = "custom-script-message";
            messageElement.classList.add(type);
            messageElement.textContent = message;

            // Thêm thông báo vào cuối danh sách
            statusBar.appendChild(messageElement);

            // Giới hạn 5 thông báo
            while (statusBar.children.length > 5) {
                statusBar.removeChild(statusBar.firstChild);
            }

            // Tự động xóa thông báo sau một khoảng thời gian
            if (duration !== null) {
                setTimeout(() => {
                    messageElement.style.animation = "fadeOut 0.3s forwards";
                    messageElement.addEventListener("animationend", () => {
                        if (messageElement.parentNode === statusBar) {
                            statusBar.removeChild(messageElement);
                        }
                    });
                }, duration);
            }
        }

        // Xóa tất cả thông báo
        clearStatusBar() {
            const statusBar = document.querySelector(".custom-script-status-bar");
            if (statusBar) {
                while (statusBar.firstChild) {
                    statusBar.removeChild(statusBar.firstChild);
                }
            }
        }

        // Hàm updateButtonState (DEPRECATED - no longer needed)
        async updateButtonState(taskName) {
            // No longer needed since UIMenuCreator is removed
            // All task buttons are now in QUEST_CONFIG list
        }
    }

                // ===============================================
                // Countdown Timer - 1 vòng lặp duy nhất cho tất cả task
                // ===============================================
        class CountdownTimer {
            constructor() {
                this.tasks = {}; // { taskName: targetTimestamp }
                this.intervalId = null;
            }

            set(taskName, delayMs) {
                this.tasks[taskName] = Date.now() + delayMs;
                const el = document.querySelector(`.quest-next-time[data-task="${taskName}"]`);
                if (el) el.classList.add('active');
                if (!this.intervalId) this._start();
            }

            remove(taskName) {
                delete this.tasks[taskName];
                const el = document.querySelector(`.quest-next-time[data-task="${taskName}"]`);
                if (el) { el.textContent = ''; el.classList.remove('active'); }
                if (Object.keys(this.tasks).length === 0) this._stop();
            }

            clear() {
                for (const name in this.tasks) this.remove(name);
                this._stop();
            }

            _start() {
                if (this.intervalId) return;
                this.intervalId = setInterval(() => this._tick(), 1000);
            }

            _stop() {
                if (this.intervalId) { clearInterval(this.intervalId); this.intervalId = null; }
            }

            _tick() {
                const now = Date.now();
                for (const taskName in this.tasks) {
                    const remaining = this.tasks[taskName] - now;
                    const el = document.querySelector(`.quest-next-time[data-task="${taskName}"]`);
                    if (!el) continue;
                    if (remaining <= 0) {
                        el.textContent = ''; el.classList.remove('active');
                        delete this.tasks[taskName];
                    } else {
                        const h = Math.floor(remaining / 3600000);
                        const m = Math.floor((remaining % 3600000) / 60000);
                        const s = Math.floor((remaining % 60000) / 1000);
                        el.textContent = h > 0 ? `⏳ ${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}` : `⏳ ${m}:${String(s).padStart(2,'0')}`;
                    }
                }
                if (Object.keys(this.tasks).length === 0) this._stop();
            }
        }
        const countdownTimer = new CountdownTimer();

    // ===============================================
    // Automactic
    // ===============================================
    class AutomationManager {
        constructor() {
            this.accountId = accountId;
            this.delay = 5000;

            // Các khoảng thời gian kiểm tra (ms)
            this.CHECK_INTERVAL_TIEN_DUYEN = 30 * 60 * 1000;
            this.INTERVAL_HOANG_VUC = 3 * 60 * 1000 + this.delay;
            this.INTERVAL_PHUC_LOI = 5 * 60 * 1000 + this.delay;
            this.INTERVAL_THI_LUYEN = 5 * 60 * 1000 + this.delay;
            this.INTERVAL_BI_CANH = 7 * 60 * 1000 + this.delay;
            this.INTERVAL_KHOANG_MACH = localStorage.getItem('khoangmach_check_interval') ? parseInt(localStorage.getItem('khoangmach_check_interval'))*60*1000 + this.delay : 5*60*1000 + this.delay;
            this.INTERVAL_HOAT_DONG_NGAY = 10 * 60 * 1000 + this.delay;

            this.timeoutIds = {};
            this.isRunning = false;
        }


        async start() {
            console.log(`[Auto] Bắt đầu quá trình tự động cho tài khoản: ${this.accountId}`);
            this.isRunning = true;
            window.isRunning = true;
            // Thực hiện các tác vụ ban đầu

            const autoDiemDanh = localStorage.getItem('autoDiemDanh') !== '0';
            //const autoTangHoa = localStorage.getItem('autoTangHoa') !== '0';

            const autoKhacTranVip = localStorage.getItem('autoKhacTranVip') !== '0';
            const autoCauNguyen = localStorage.getItem('autoCaunguyen') !== '0';
            const autoTienDuyen = localStorage.getItem('autoTienDuyen') !== '0';
            const autoThiLuyen = localStorage.getItem('autoThiLuyen') !== '0';
            const autoPhucLoi = localStorage.getItem('autoPhucLoi') !== '0';
            const autoHoangVuc = localStorage.getItem('autoHoangVuc') !== '0';
            const autoBiCanh = localStorage.getItem('autoBiCanh') !== '0';
            const autoLuanVo = localStorage.getItem('autoLuanVo') !== '0';
            const autoDoThach = localStorage.getItem('autoDoThach') !== '0';
            const autoKhoangMach = localStorage.getItem('autoKhoangMach') !== '0';

            if (autoDiemDanh) {   await this.doInitialTasks(); }
            // Bắt đầu chu kỳ hẹn giờ cho Tiên Duyên
            if (autoTienDuyen) {  await this.scheduleTienDuyenCheck() }
            // Đổ thạch
            if (autoDoThach) {  await this.scheduleDoThach()  }
            // Lên lịch các tác vụ định kỳ
            if (autoHoangVuc) {  
                await new Promise(resolve => setTimeout(resolve,   1000));
                this.scheduleTask('hoangvuc', () => hoangvuc.doHoangVuc(), this.INTERVAL_HOANG_VUC);
            }
            if (autoThiLuyen) {
                await new Promise(resolve => setTimeout(resolve,  1000));
                this.scheduleTask('thiluyen', () => doThiLuyenTongMon(), this.INTERVAL_THI_LUYEN);
            }
            if (autoPhucLoi) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                await this.scheduleTask('phucloi', () => doPhucLoiDuong(), this.INTERVAL_PHUC_LOI);
            }
            if (autoKhoangMach) {
                await new Promise(resolve => setTimeout(resolve,  1000));
                this.INTERVAL_KHOANG_MACH = localStorage.getItem('khoangmach_check_interval') ? parseInt(localStorage.getItem('khoangmach_check_interval'))*60*1000 + this.delay : 5*60*1000 + this.delay;
                await this.scheduleTask('khoangmach', () => khoangmach.doKhoangMach(), this.INTERVAL_KHOANG_MACH);
            }

            if (autoBiCanh) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                await this.scheduleTask("bicanh", async () => {
                    // Đọc giữ lượt đánh bí cảnh
                    const reserve = Number(localStorage.getItem("reserveBiCanhAttacks") || "0");
                    console.log("Giá trị reserveBiCanhAttacks trong autobicanh:", reserve);
                    await bicanh.doBiCanh();
                }, this.INTERVAL_BI_CANH);
            }

            if (autoKhacTranVip)  { await this.luotkhactranvip()}

            if (autoCauNguyen) { await this.caunguyentienduyen()}

            // if (autoLuanVo) {
            //     await new Promise(resolve => setTimeout(resolve,  1000));
            //     await this.scheduleLuanVo();
            // }

            await new Promise(resolve => setTimeout(resolve, 1000));
            this.scheduleHoatDongNgay();
            const _sh = parseInt(localStorage.getItem('selfSchedule_h') ?? '0', 10) || 0;
            const _sm = parseInt(localStorage.getItem('selfSchedule_m') ?? '30', 10);
            this.selfSchedule(_sh, _sm, 0); // Lên lịch tự động chạy theo cài đặt (mặc định 00:30 hàng ngày)
            // this.applyPromoCode();
        }


        async eventSchedule() {
            const now = Date.now();
            const nextEventTime = taskTracker.getNextTime(accountId, 'event');

            // Logic tính thời gian chờ mặc định
            // Nếu chưa có lịch hoặc tính ra số âm (quá khứ) thì đợi 1s rồi check lại, ngược lại đợi đúng thời gian
            let waitTime = 1000;

            if (nextEventTime && now >= nextEventTime) {
                console.log("[Auto] ⏰ Đã đến giờ sự kiện. Đang thực hiện...");
                try {
                    // Thực hiện nhiệm vụ
                    await doDuaTopTongMon();

                    // QUAN TRỌNG: Hàm doDuaTopTongMon phải có lệnh cập nhật lại nextEventTime (taskTracker.adjustTaskTime)
                    // Nếu không cập nhật thời gian, nó sẽ lặp vô tận liên tục gây treo trình duyệt.
                } catch (error) {
                    console.error("[Auto] ❌ Lỗi khi thực hiện sự kiện:", error);
                }

                // Sau khi chạy xong (dù lỗi hay không), đợi 5 giây rồi check lại lịch mới
                waitTime = 5000;
            } else {
                // Chưa đến giờ, tính thời gian chờ
                if (nextEventTime) {
                    waitTime = nextEventTime - now;
                    // Đảm bảo không chờ số âm (nếu máy tính bị lag)
                    if (waitTime < 0) waitTime = 1000;
                } else {
                    // Nếu không tìm thấy lịch (null), mặc định check lại sau 5 phút
                    waitTime = 5 * 60 * 1000;
                }

            }
            // Gọi đệ quy để duy trì vòng lặp vĩnh viễn
            // setTimeout(() => {
            //     this.eventSchedule();
            // }, waitTime + (this.delay || 0));
        }
        /**Lên lịch tự chạy lại vào lúc 1 giờ */
        async selfSchedule( h=1, m=0, s=0 ) {
            if (!this.isRunning) return;
            const now = Date.now();
            const timeToRerun = new Date();
            timeToRerun.setHours(h, m, s, 0);
            if (timeToRerun.getTime() <= now) {
                timeToRerun.setDate(timeToRerun.getDate() + 1);
            }
            const delay = timeToRerun.getTime() - now;
            console.log(`[Auto] Lên lịch tự chạy lại vào lúc ${h} giờ ${m} phút ${s} giây. Thời gian chờ: ${delay}ms.`);
            countdownTimer.set('restart', delay);
            setTimeout(() => { this.stop(); }, delay);
            setTimeout(() => { this.start(); }, delay+1000);

        }

        async doInitialTasks() {
            if (!taskTracker.isTaskDone(this.accountId, 'diemdanh')) {
                try {
                    const nonce = await getNonce()
                    if (!nonce) return
                    await doDailyCheckin(nonce);
                    await doClanDailyCheckin(nonce);
                    await vandap.doVanDap(nonce);
                } catch (e) {
                    console.error("[Auto] Lỗi khi thực hiện Điểm danh, tế lễ, vấn đáp:", e);
                }
            }
        }


        async luotkhactranvip() {
            if (!taskTracker.isTaskDone(this.accountId, 'luotkhactranvip')) {
                try {
                    const nonce = await getNonce()
                    if (!nonce) return
                    const result = await khactran.claimDailyTurns(this.accountId);
                    console.log("Kết quả claimDailyTurns:", result);
                } catch (e) {
                    console.error("[Auto] lỗi nhận lượt khắc trận vip:", e);
                }
            }
        }

        async caunguyentienduyen() {
            if (!taskTracker.isTaskDone(this.accountId, 'tienduyen')) {
                try {
                    const nonce = await getNonce()
                    if (!nonce) return
                    const result = await docaunguyen(this.accountId);
                    console.log("Kết quả cầu nguyện:", result);
                } catch (e) {
                    console.error("[Cầu nguyện Tiên duyên]:", e);
                }
            }
        }

        async scheduleTienDuyenCheck() {
            const now = Date.now();
            const lastCheckTienDuyen = taskTracker.getLastCheckTienDuyen(this.accountId);
            let timeToNextCheck;

            if (lastCheckTienDuyen === null || now - lastCheckTienDuyen >= this.CHECK_INTERVAL_TIEN_DUYEN) {
                console.log("[Auto] Đã đến giờ làm Tiên Duyên. Đang thực hiện...");
                try {
                    await tienduyen.doTienDuyen();
                } catch (error) {
                    console.error("[Auto] Lỗi khi thực hiện Tiên Duyên:", error);
                }
                timeToNextCheck = this.CHECK_INTERVAL_TIEN_DUYEN;
            } else {
                timeToNextCheck = this.CHECK_INTERVAL_TIEN_DUYEN - (now - lastCheckTienDuyen);
                console.log(`[Auto] Chưa đến giờ tiên duyên. Sẽ chờ ${timeToNextCheck}ms.`);
            }

            // Hẹn giờ gọi lại chính nó sau khoảng thời gian đã tính
            if (this.tienduyenTimeout) clearTimeout(this.tienduyenTimeout);
            countdownTimer.set('tienduyen', timeToNextCheck);
            this.tienduyenTimeout = setTimeout(() => this.scheduleTienDuyenCheck(), timeToNextCheck);
        }

        /**
        * Tạo lịch trình cho một nhiệm vụ cụ thể.
        - Ví dụ: scheduleTask('thiluyen', () => thiluyen.doThiLuyen(), this.INTERVAL_THI_LUYEN, 'thiluyenTimeout')
        * @param {string} taskName Tên của nhiệm vụ, dùng để truy vấn trạng thái (ví dụ: 'thiluyen').
        * @param {Function} taskAction Hàm bất đồng bộ thực thi nhiệm vụ (ví dụ: `hoangvuc.doHoangVuc`).
        * @param {number} interval Chu kỳ lặp lại của nhiệm vụ tính bằng mili giây.
        */
        async scheduleTask(taskName, taskAction, interval) {
            if (this.timeoutIds[taskName]) clearTimeout(this.timeoutIds[taskName]);
            let isTaskDone;
            if (taskName === 'bicanh' && await bicanh.isDailyLimit()) {
                isTaskDone = true;
            } else {
                isTaskDone = taskTracker.isTaskDone(this.accountId, taskName);
            }
            // Kiểm tra và dừng lịch trình nếu nhiệm vụ đã hoàn thành
            if (isTaskDone) {
                return;
            }

            const now = Date.now();
            const nextTime = taskTracker.getNextTime(this.accountId, taskName);
            let timeToNextCheck;

            if (nextTime === null || now >= nextTime) {
                console.log(`[Auto] Đã đến giờ làm nhiệm vụ: ${taskName}. Đang thực hiện...`);
                try {
                    // Cho phép taskAction trả về delay thực tế (ms hoặc chuỗi thời gian)
                    let result = await taskAction();
                    // Cập nhật trạng thái UI sau khi task chạy xong
                    updateAllQuestButtons().catch(() => {});
                    // Nếu trả về số, dùng làm delay
                    if (typeof result === 'number' && !isNaN(result) && result > 0) {
                        timeToNextCheck = result;
                    } else if (typeof result === 'string') {
                        // Nếu trả về chuỗi, parse ra ms
                        const ms = parseDelayString(result);
                        timeToNextCheck = ms > 0 ? ms : interval;
                    } else {
                        timeToNextCheck = interval;
                    }
                } catch (error) {
                    console.error(`[Auto] Lỗi khi thực hiện nhiệm vụ ${taskName}:`, error);
                    // Có thể đặt thời gian chờ ngắn hơn khi có lỗi để thử lại
                    timeToNextCheck = 3*60 * 1000; // Thử lại sau 3 phút
                }
            } else {
                timeToNextCheck = Math.max(nextTime - now, 0);
                console.log(`[Auto] Nhiệm vụ ${taskName} chưa đến giờ, sẽ chờ ${timeToNextCheck}ms.`);
            }

            // Hẹn giờ cho lần chạy tiếp theo
            if (this.timeoutIds[taskName]) clearTimeout(this.timeoutIds[taskName]);
            if (!taskTracker.isTaskDone(accountId,taskName)) {
                const taskFullName = {
                    hoangvuc: "Hoang Vực",
                    phucloi: "Phúc Lợi",
                    thiluyen: "Thí Luyện",
                    bicanh: "Bí Cảnh",
                    khoangmach: "Khoáng Mạch"
                }[taskName];
                //showNotification
                if (taskName === 'bicanh') {
                    const isReserveHold = await bicanh.isReserveHold();
                    if (isReserveHold) {
                        //createUI.updateStatusBar(`🛑 ${taskFullName}: đang giữ lượt, không hẹn giờ`, 'info', 0);
                        return; // dừng hẳn, không hẹn giờ
                    }
                }
                // Cập nhật countdown vào từng nhiệm vụ (dùng 1 vòng lặp chung)
                countdownTimer.set(taskName, timeToNextCheck);
                this.timeoutIds[taskName] = setTimeout(() => this.scheduleTask(taskName, taskAction, interval), timeToNextCheck);
            }
        }

        // Hàm parse chuỗi thời gian dạng "6 phút 0 giây" hoặc "0 phút 40 giây" thành ms
        async parseDelayString(str) {
            if (!str) return 0;
            let m = 0, s = 0, h = 0;
            // Hỗ trợ cả dạng "6 phút 0 giây", "40 giây", "1 giờ 2 phút 3 giây"
            const hourMatch = str.match(/(\d+)\s*giờ/);
            if (hourMatch) h = parseInt(hourMatch[1]);
            const minMatch = str.match(/(\d+)\s*phút/);
            if (minMatch) m = parseInt(minMatch[1]);
            const secMatch = str.match(/(\d+)\s*giây/);
            if (secMatch) s = parseInt(secMatch[1]);
            return h*3600000 + m*60000 + s*1000;
        }

        async scheduleLuanVo() {
            const isDone = taskTracker.isTaskDone(this.accountId, 'luanvo');
            if (isDone) {
                if (this.luanvoTimeout) clearTimeout(this.luanvoTimeout);
                return;
            }
            await luanvo.startLuanVo();
            let timeTo21h = new Date();
            timeTo21h.setHours(21, 1, 0, 0);
            const delay = timeTo21h.getTime() - Date.now();
            console.log(`[Auto] Lên lịch Luận Võ vào lúc 00:01. Thời gian chờ: ${delay}ms.`);
            if (this.luanvoTimeout) clearTimeout(this.luanvoTimeout);
            if (delay < 0) {
                await luanvo.thueTieuViem();
                await luanvo.doLuanVo(true);
            } else {
                countdownTimer.set('luanvo', delay);
                this.luanvoTimeout = setTimeout(() => this.scheduleLuanVo(), delay);
            }
        }

        async scheduleDoThach() {
            const status = taskTracker.getTaskStatus(accountId, 'dothach');
                const isBetPlaced = status.betplaced;
                const isRewardClaimed = status.reward_claimed;

                const currentHour = parseInt(
                    new Date().toLocaleString('en-US', {
                        timeZone: 'Asia/Ho_Chi_Minh',
                        hour: 'numeric',
                        hour12: false
                    }),
                    10
                );

                let nextActionTime; // Giờ hành động tiếp theo (ví dụ: 13, 16, 21, 6)
                let timeToNextCheck; // Thời gian chờ (mili giây)

                const calculateTimeToNextHour = (targetHour) => {
                    const now = new Date();
                    const nextTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), targetHour, 0, 0, 0);
                    if (now.getHours() >= targetHour) {
                        nextTime.setDate(nextTime.getDate() + 1); // Nếu giờ mục tiêu đã qua, chuyển sang ngày mai
                    }
                    return nextTime.getTime() - now.getTime();
                };

                if (isBetPlaced) {
                    // Đã đặt cược, chờ đến giờ nhận thưởng
                    if (currentHour >= 6 && currentHour < 13) {
                        nextActionTime = 13; // Chờ đến 13h để nhận thưởng lần 1
                    } else if (currentHour >= 16 && currentHour < 21) {
                        nextActionTime = 21; // Chờ đến 21h để nhận thưởng lần 2
                    } else {
                        console.log('[Đổ Thạch] Đã đặt cược nhưng không trong khung giờ cược, chờ khung giờ nhận thưởng tiếp theo.');
                        if (currentHour < 13) {
                            nextActionTime = 13;
                        } else if (currentHour < 21) {
                            nextActionTime = 21;
                        } else {
                            nextActionTime = 6; // Chờ đến 6h sáng mai
                        }
                    }
                } else if (isRewardClaimed) {
                    // Đã nhận thưởng, chờ đến giờ đặt cược tiếp theo
                    if (currentHour >= 13 && currentHour < 16) {
                        nextActionTime = 16; // Chờ đến 16h để đặt cược lần 2
                    } else {
                        nextActionTime = 6; // Chờ đến 6h sáng hôm sau
                    }
                } else {
                    const stoneType = localStorage.getItem('dice-roll-choice') ?? 'tai';
                    // Chưa đặt cược hoặc chưa nhận thưởng. Cần kiểm tra khung giờ hiện tại
                    if (currentHour >= 6 && currentHour < 13) {
                        console.log('[Đổ Thạch] Đang trong khung giờ 6h-13h. Đang đặt cược...');
                        await dothach.run(stoneType); // Thực hiện đặt cược
                        createUI.updateButtonState('dothach');
                        nextActionTime = 13; // Sau khi cược, chờ đến 13h để kiểm tra thưởng
                    } else if (currentHour >= 16 && currentHour < 21) {
                        console.log('[Đổ Thạch] Đang trong khung giờ 16h-21h. Đang đặt cược...');
                        await dothach.run(stoneType); // Thực hiện đặt cược
                        createUI.updateButtonState('dothach');
                        nextActionTime = 21; // Sau khi cược, chờ đến 21h để kiểm tra thưởng
                        setTimeout(loadHH3DProfile, 100); // cập nhật profile sau khi đặt cược
                    } else {
                        // Không trong khung giờ nào, chờ đến khung giờ đặt cược tiếp theo
                        console.log('[Đổ Thạch] Không trong khung giờ cược. Chờ...');
                        if (currentHour < 6) {
                            nextActionTime = 6;
                        } else if (currentHour < 16) {
                            nextActionTime = 16;
                        } else {
                            nextActionTime = 6; // Chờ đến 6h sáng mai
                        }
                    }
                }

                timeToNextCheck = calculateTimeToNextHour(nextActionTime);

                // Hủy timeout cũ nếu có và thiết lập timeout mới
                if (this.dothachTimeout) clearTimeout(this.dothachTimeout);
                countdownTimer.set('dothach', timeToNextCheck);
                this.dothachTimeout = setTimeout(() => this.scheduleDoThach(), timeToNextCheck);

                console.log(`[Đổ Thạch] Lần kiểm tra tiếp theo lúc: ${new Date(Date.now() + timeToNextCheck).toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}`);
            }

        async scheduleHoatDongNgay() {
            const isDone = taskTracker.isTaskDone(this.accountId, 'hoatdongngay');
            if (isDone) {
                console.log("[Auto] Hoạt Động Ngày đã hoàn thành, không cần lên lịch.");
                if (this.hoatdongngayTimeout) clearTimeout(this.hoatdongngayTimeout);
                loadHH3DProfile().catch(() => {});
                return;
            }
            const isHoangVucDone = taskTracker.isTaskDone(this.accountId, 'hoangvuc');
            const isPhucLoiDone = taskTracker.isTaskDone(this.accountId, 'phucloi');
            const isDiemDanhDone = taskTracker.isTaskDone(this.accountId, 'diemdanh');
            // const isLuanVoDone = taskTracker.isTaskDone(this.accountId, 'luanvo');
            if (isHoangVucDone && isPhucLoiDone && isDiemDanhDone ) {
                console.log("[Auto] Điều kiện đã đủ, đang thực hiện Hoạt Động Ngày...");
                try {
                    await hoatdongngay.doHoatDongNgay();
                    // Cập nhật trạng thái UI sau khi task chạy xong
                    updateAllQuestButtons().catch(() => {});
                    if (this.hoatdongngayTimeout) clearTimeout(this.hoatdongngayTimeout);
                    if (taskTracker.isTaskDone(this.accountId, 'hoatdongngay') && this.hoatdongngayTimeout) {
                        return;
                    } else {
                        countdownTimer.set('hoatdongngay', 5*60*1000);
                        this.hoatdongngayTimeout = setTimeout(() => this.scheduleHoatDongNgay(), 5*60*1000);
                    }
                }
                catch (e) {
                    console.error("[Auto] Lỗi khi thực hiện Hoạt Động Ngày:", e);
                }
            } else {
                if (this.hoatdongngayTimeout) clearTimeout(this.hoatdongngayTimeout);
                countdownTimer.set('hoatdongngay', this.INTERVAL_HOAT_DONG_NGAY);
                this.hoatdongngayTimeout = setTimeout(() => this.scheduleHoatDongNgay(), this.INTERVAL_HOAT_DONG_NGAY);
            }
        }

        stop() {
            if (!this.isRunning || !window.isRunning) return;
            window.isRunning = false;
            for (const taskName in this.timeoutIds) {
                if (this.timeoutIds[taskName]) {
                    clearTimeout(this.timeoutIds[taskName]);
                    this.timeoutIds[taskName] = null; // Đặt lại giá trị để tránh rò rỉ bộ nhớ
                    console.log(`[Auto] Đã hủy hẹn giờ cho nhiệm vụ: ${taskName}`);
                }
            }
            if (this.tienduyenTimeout) {
                clearTimeout(this.tienduyenTimeout);
                console.log(`Đã dừng quá trình tự động tiên duyên`);
            }
            if (this.dothachTimeout) {
                clearTimeout(this.dothachTimeout);
                console.log(`Đã dừng quá trình tự động đổ thạch`);
            }
            if (this.hoatdongngayTimeout) {
                clearTimeout(this.hoatdongngayTimeout);
                console.log(`Đã dừng quá trình tự động hoạt động ngày`);
            }
            // Xóa tất cả countdown trừ 'restart' (vẫn đang chờ selfSchedule)
            Object.keys(countdownTimer.tasks).forEach(name => {
                if (name !== 'restart') countdownTimer.remove(name);
            });
            createUI.clearStatusBar();
        }

        checkAndStart() {
            if (localStorage.getItem('autorunEnabled') === null) {
                localStorage.setItem('autorunEnabled', '0');
            }

            let autorunEnabled = localStorage.getItem('autorunEnabled') === '1';

            if (autorunEnabled) {
                console.log('[Automation] Tự động khởi động Autorun...');

                // Tạo một hàm chờ để đảm bảo UI đã sẵn sàng
                const checkStatusIcon = () => {
                    const statusIcon = document.querySelector('.custom-script-status-icon');
                    if (statusIcon) {
                        // Nếu icon đã tồn tại, cập nhật trạng thái và bắt đầu tác vụ
                        this.start();
                    } else {
                        // Nếu icon chưa tồn tại, chờ 100ms và thử lại
                        setTimeout(checkStatusIcon, 100);
                    }
                };

                // Bắt đầu quá trình kiểm tra
                checkStatusIcon();
            } else {
                console.log('[Automation] Autorun không được bật, sẽ không khởi động tự động.');
            }
        }
    }
        // ===============================================
        // HIỆN TU VI KHOÁNG MẠCH
        // ===============================================
   class hienTuviKhoangMach {
        constructor() {
            this.selfTuViCache = null;
            this.mineImageSelector = '.mine-image';
            this.attackButtonSelector = '.attack-btn';
            this.currentMineUsers = []; // Sẽ lưu dữ liệu người dùng tại đây
            this.tempObserver = null; // Biến để lưu MutationObserver tạm thời
            this.nonceGetUserInMine = null;
            this.nonce = null;
            this.headers = {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With': 'XMLHttpRequest'
            };
            this.currentMineId = null;
            this.tempObserverRearrange = null; // Biến để lưu MutationObserver tạm thời khi sắp xếp

        }

        async waitForElement(selector, timeout = 15000) {
            const found = document.querySelector(selector);
            if (found) return Promise.resolve(found);
            return new Promise((resolve) => {
                const obs = new MutationObserver(() => {
                    const el = document.querySelector(selector);
                    if (el) {
                        obs.disconnect();
                        clearTimeout(timer);
                        resolve(el);
                    }
                });
                obs.observe(document.documentElement || document.body, { childList: true, subtree: true });
                const timer = setTimeout(() => {
                    obs.disconnect();
                    resolve(null);
                }, timeout);
            });
        }
        async getNonceGetUserInMine() {
            const htmlSource = document.documentElement.innerHTML;
            const regex = /action:\s*'(?:get_users_in_mine|kmList)',[\s\S]*?security:\s*'([a-f0-9]+)'/;
            const match = htmlSource.match(regex);
            return match ? match[1] : null;
        }

        async getNonce() {
            if (typeof restNonce !== 'undefined' && restNonce) {
                return restNonce;
            }

            const scripts = document.querySelectorAll('script');
            for (const script of scripts) {
                const match = script.innerHTML.match(/"restNonce"\s*:\s*"([a-f0-9]+)"/i);
                if (match) {
                    return match[1];
                }
            }

            try {
                const nonce = await getSecurityNonce(weburl + '?t', "restNonce");
                if (nonce) {
                    return nonce;
                }
            } catch (error) {
                console.error("Failed to get security nonce", error);
            }

            return null;
        }

        async getSelfTuVi(forceRefresh = false) {
            if (!forceRefresh && this.selfTuViCache !== null) {
                return this.selfTuViCache;
            }
            // ưu tiên header hiện tu vi
            const el = document.querySelector('#head_manage_acc');
            const text = (el?.textContent || '').trim();
            let num = text.match(/\d+/);
            if (num) {
                this.selfTuViCache = parseInt(num[0]);
                return this.selfTuViCache;
            }
            // fallback: quét body (trường hợp UI đổi)
            const bodyText = (document.body?.innerText || '').slice(0, 5000);
            num = bodyText.match(/Tu\s*Vi\s*[:：]?\s*(\d+)/i) || bodyText.match(/(\d{6,})/);
            if (num) {
                this.selfTuViCache = parseInt(num[1] || num[0]);
                return this.selfTuViCache;
            }
            return null;
        }

        async getProfileTier(userId) {
            if (!userId) return null;
            try {
                const res = await fetch(`${weburl}profile/${userId}/`);
                if (!res.ok) return null;

                const text = await res.text(); // phải await
                const doc = new DOMParser().parseFromString(text, 'text/html');

                const h4 = doc.querySelector('h4');
                if (!h4) return null;

                // lấy text từ <b> nếu có, nếu không fallback div/h4
                const raw = h4.querySelector('b')?.textContent
                        || h4.querySelector('div')?.textContent
                        || h4.textContent
                        || "";
                console.log(`Lấy cảnh giới cho userId ${userId}:`, raw.trim());
                return raw.trim();
            } catch (e) {
                console.error(`${this.logPrefix} ❌ Lỗi mạng (lấy cảnh giới):`, e);
                return null;
            }
        }

        winRate(selfTuVi, opponentTuVi) {
            if (!selfTuVi || !opponentTuVi) return -1;
            if (typeof selfTuVi !== 'number' || typeof opponentTuVi !== 'number') return -1;
            if (selfTuVi <= 0 || opponentTuVi <= 0) return -1;
            if (selfTuVi >= 10 * opponentTuVi) return 100;
            if (opponentTuVi >= 10 * selfTuVi) return 0;
            let winChance = 50;
            const diff = selfTuVi - opponentTuVi;
            const ratio = diff > 0 ? selfTuVi / opponentTuVi : opponentTuVi / selfTuVi;
            const factor = ratio >= 8 ? 1 : ratio >= 7 ? 0.9 : ratio >= 6 ? 0.8 :
                ratio >= 5 ? 0.7 : ratio >= 4 ? 0.6 : ratio >= 3 ? 0.5 :
                ratio >= 2 ? 0.4 : 0.3;
            winChance += (diff / 1000) * factor;
            return Math.max(0, Math.min(100, winChance));
        }

        async upsertTuViInfo(btn, userId, opponentTuVi, myTuVi) {
            const cls = 'hh3d-tuvi-info';
            const next = btn.nextElementSibling;
            const opponentTuViText = typeof opponentTuVi === 'number' ? opponentTuVi : 'Unknown';

            // Tạo nội dung HTML một lần duy nhất
            const rate = this.winRate(myTuVi, opponentTuVi).toFixed(2);
            const rateNumber = parseFloat(rate);
            let rateColor;
            if (rateNumber === -1) {
                rateColor = '#808080'; // Grey
            }
                else if (rateNumber < 25) {
                rateColor = '#ff5f5f'; // Red
            } else if (rateNumber > 75) {
                rateColor = '#00ff00'; // Green
            } else {
                rateColor = '#ffff00ff'; // White
            }

            let displayRate = rate;
            if (rateNumber === 0.00) {
                displayRate = '0';
            } else if (rateNumber === 100.00) {
                displayRate = '100';
            } else if (rateNumber === -1) {
                displayRate = 'Không rõ';
            }
            let innerHTMLContent = '';
            if (myTuVi <= 10 * opponentTuVi) {
            innerHTMLContent = `
                <p><strong>Tu Vi:</strong> <span style="font-weight: bold; color: #ffff00ff;">${opponentTuViText}</span></p>
                <p><strong>Tỷ Lệ Thắng:</strong> <span style="font-weight: bold; color: ${rateColor};">${displayRate}%</span></p>
            `;
            } else {
            innerHTMLContent = `
                <p><strong>Tu Vi:</strong> <span style="font-weight: bold; color: #ffff00ff;">${opponentTuViText}</span></p>
                <p><span style="font-weight: bold; color: #00ff00ff;">Không tốn lượt</span></p>
            `;
            }

            if (next && next.classList.contains(cls) && next.dataset.userId === String(userId)) {
                next.innerHTML = innerHTMLContent;
                return;
            }

            document.querySelectorAll(`.${cls}[data-user-id="${userId}"]`).forEach(el => {
                if (el !== next) el.remove();
            });

            const info = document.createElement('div');
            info.className = cls;
            info.dataset.userId = String(userId);
            info.style.fontSize = '12px';
            info.style.color = '#fff';
            info.style.marginTop = '3px';
            info.style.backgroundColor = 'none';
            info.style.padding = '0px 0px';
            info.style.border = 'none';

            // Sử dụng biến đã tạo ở trên
            info.innerHTML = innerHTMLContent;

            btn.insertAdjacentElement('afterend', info);
        }

        async upsertTierInfo(btn, userId) {
            const cls = 'hh3d-tuvi-info';
            const next = btn.nextElementSibling;
            const tierText = await this.getProfileTier(userId);
            console.log(`UserID: ${userId}, Tier: ${tierText}`);
            if (!tierText) return;
            if (next && next.classList.contains(cls) && next.dataset.userId === String(userId)) {
                next.innerHTML = `<p><strong>Cảnh giới:</strong> <span style="font-weight: bold; color: #ffff00ff;">${tierText}</span></p>`;
                return;
            }

            document.querySelectorAll(`.${cls}[data-user-id="${userId}"]`).forEach(el => {
                if (el !== next) el.remove();
            });
            const info = document.createElement('div');
            info.className = cls;
            info.dataset.userId = String(userId);
            info.style.fontSize = '12px';
            info.style.color = '#fff';
            info.style.marginTop = '3px';
            info.style.backgroundColor = 'none';
            info.style.padding = '0px 0px';
            info.style.border = 'none';
            info.innerHTML = `<p><strong>Cảnh giới:</strong> <span style="font-weight: bold; color: #ffff00ff;">${tierText}</span></p>`;
            btn.insertAdjacentElement('afterend', info);
        }

        async getUsersInMine(mineId) {
            let securityToken = null;

            // Cách 1: Lấy từ unsafeWindow (Biến thật của trang web)
            if (typeof unsafeWindow !== 'undefined' && unsafeWindow.hh3dData && unsafeWindow.hh3dData.securityToken) {
                securityToken = unsafeWindow.hh3dData.securityToken;
            }
            // Cách 2: Lấy từ window thường
            else if (typeof hh3dData !== 'undefined' && hh3dData.securityToken) {
                securityToken = hh3dData.securityToken;
            }

            // Cách 3: Nếu vẫn null -> Gọi hàm quét (Fallback cuối cùng)
            if (!securityToken) {
                console.log(`${this.logPrefix} ⚠️ Token biến global bị thiếu, đang fetch lại...`);
                // Gọi hàm getSecurityToken chúng ta đã viết ở trên
                securityToken = await getSecurityToken(this.khoangMachUrl || window.location.href);
            }
            if (!this.nonceGetUserInMine || !securityToken) {
                let errorMsg = 'Lỗi (get_users):';
                if (!this.nonceGetUserInMine) errorMsg += " Nonce (security) chưa được cung cấp.";
                if (!securityToken) errorMsg += " Không tìm thấy 'security_token' (hh3dData).";

                showNotification(errorMsg, 'error');
                return null;
            }

            const payload = new URLSearchParams({
                action: hData && hData.act ? hData.act.kmList :'get_users_in_mine',
                mine_id: mineId,
                security_token: securityToken,
                security: this.nonceGetUserInMine
            });

            try {
                const r = await fetch(ajaxUrl, {
                    method: 'POST',
                    headers: this.headers,
                    body: payload,
                    credentials: 'include'
                });
                const d = await r.json();

                return d.success ? d.data : (showNotification(d.message || 'Lỗi lấy thông tin người chơi.', 'error'), null);

            } catch (e) {
                console.error(`${this.logPrefix} ❌ Lỗi mạng (lấy user):`, e);
                return null;
            }
        }

        async getTuVi(userId) {
            // 0. Chuẩn bị Nonce & Headers
            if (!this.nonce) {
                this.nonce = await this.getNonce();
            }
            const nonce = this.nonce;
            if (!nonce) return null;

            const headers = {
                "Content-Type": "application/json",
                "X-WP-Nonce": nonce
            };
            const targetId = String(userId);

            // ============================================================
            // 🟢 CÁCH 1: LOGIC CŨ (GIỮ NGUYÊN BẢN GỐC)
            // ============================================================
            try {
                const res = await fetch(`${weburl}/wp-json/luan-vo/v1/search-users`, {
                    method: "POST",
                    headers: headers,
                    body: JSON.stringify({ query: targetId, page: 1 }),
                    credentials: "include",
                    mode: "cors"
                });

                // Logic gốc: Lấy user đầu tiên trong danh sách (users[0])
                const points = res.ok ? (await res.json())?.data?.users?.[0]?.points ?? null : null;

                // Nếu tìm thấy điểm -> Trả về luôn
                if (points !== null && points !== undefined) {
                    return points;
                }
            } catch (e) {
                // Lỗi ở cách 1 -> Bỏ qua để chạy xuống cách 2
            }

            // ============================================================
            // 🔴 CÁCH 2: FALLBACK (FOLLOW -> SCAN -> UNFOLLOW)
            // Chỉ chạy khi Cách 1 trả về null hoặc lỗi
            // ============================================================
            // console.log(`[GetTuVi] Cách 1 thất bại, đang dùng Fallback cho ID ${targetId}...`);

            let tuVi = null;

            try {
                // B2.1: Follow
                await fetch(`${weburl}/wp-json/luan-vo/v1/follow`, {
                    method: "POST",
                    headers: headers,
                    body: JSON.stringify({ followed_user_id: targetId }),
                    credentials: "include",
                    mode: "cors"
                });

                // B2.2: Lấy danh sách Following
                const resList = await fetch(`${weburl}/wp-json/luan-vo/v1/get-following-users`, {
                    method: "POST",
                    headers: headers,
                    body: JSON.stringify({ page: 1 }),
                    credentials: "include",
                    mode: "cors"
                });

                if (resList.ok) {
                    const jsonList = await resList.json();
                    if (jsonList.success && jsonList.data && Array.isArray(jsonList.data.users)) {
                        // Ở danh sách follow thì phải tìm chính xác ID kẻo lấy nhầm người khác
                        const targetUser = jsonList.data.users.find(u => String(u.id) === targetId);
                        if (targetUser) {
                            tuVi = targetUser.points;
                        }
                    }
                }

            } catch (e) {
                console.error(`[GetTuVi] Fallback lỗi:`, e);
            } finally {
                // B2.3: Unfollow (Luôn chạy để dọn rác)
                try {
                    await fetch(`${weburl}/wp-json/luan-vo/v1/unfollow`, {
                        method: "POST",
                        headers: headers,
                        body: JSON.stringify({ unfollow_user_id: targetId }),
                        credentials: "include",
                        mode: "cors"
                    });
                } catch (ignore) {}
            }

            return tuVi;
        }

        async showTotalEnemies(mineId) {
            const data = await this.getUsersInMine(mineId);
            const currentMineUsers = data && data.users ? data.users : [];
            let totalEnemies = 0;
            let totalLienMinh = 0;
            let totalDongMon = 0;
            const myTuVi = await this.getSelfTuVi();
            let isInMine = currentMineUsers.some(user => user.id.toString() === accountId.toString());
            for (let user of currentMineUsers) {
                if (user.dong_mon) {
                    totalDongMon++;
                } else if (user.lien_minh) {
                    totalLienMinh++;
                } else {
                        totalEnemies++;
                }
            }


            const bonus_display = document.querySelector('#bonus-display');
            const batquai_section = document.querySelector('#batquai-section');
            const pagination = document.querySelector('.pagination');
            const page_indicator = document.querySelector('#page-indicator');
            if (bonus_display) {
                let existingInfo = document.querySelector('.hh3d-mine-info');
                if (!existingInfo) {
                    existingInfo = document.createElement('div');
                    existingInfo.className = 'hh3d-mine-info';
                    //existingInfo.style.right = '5px';
                    existingInfo.style.fontSize = '11px';
                    existingInfo.style.color = '#fff';
                    existingInfo.style.marginLeft = '-1px';
                    existingInfo.style.backgroundColor = 'none';
                    existingInfo.style.padding = '0px 0px';
                    existingInfo.style.border = 'none';
                    existingInfo.style.textAlign = 'left';
                    existingInfo.style.fontFamily = 'Font Awesome 5 Free';
                    bonus_display.prepend(existingInfo);
                    bonus_display.style.display = 'block';
                    batquai_section.style.display = 'block';
                    const observer = new MutationObserver(() => {
                        bonus_display.style.display = 'block';
                        batquai_section.style.display = 'block';
                        pagination.style.display = 'block';
                        page_indicator.style.display = 'block';
                        });
                    observer.observe(bonus_display, { attributes: true, attributeFilter: ['style'] });
                    observer.observe(batquai_section, { attributes: true, attributeFilter: ['style'] });
                    observer.observe(pagination, { attributes: true, attributeFilter: ['style'] });
                    observer.observe(page_indicator, { attributes: true, attributeFilter: ['style'] });
                }

                existingInfo.innerHTML = `
                    <h style="color: #ff5f5f;">🩸Kẻ địch: <b>${totalEnemies}</b></h><br>
                    <h style="color: #ffff00;">🤝Liên Minh: <b>${totalLienMinh}</b></h><br>
                    <h style="color: #9c59bdff;">☯️Đồng Môn: <b>${totalDongMon}</b></h>
                `;
            }
        }

        async addEventListenersToReloadBtn(mineId) {
            const reloadBtn = document.querySelector('#reload-btn');
            if (reloadBtn && !reloadBtn.dataset.listenerAdded) {
                reloadBtn.addEventListener('click', async () => {
                    this.showTotalEnemies(mineId);
                });
                reloadBtn.dataset.listenerAdded = 'true';
            }
        }

        async addEventListenersToMines() {
            const mineImages = document.querySelectorAll(this.mineImageSelector);
            mineImages.forEach(image => {
                if (!image.dataset.listenerAdded) {
                    image.addEventListener('click', async (event) => {
                        const mineId = event.currentTarget.getAttribute('data-mine-id');
                        if (mineId) {
                            this.showTotalEnemies(mineId);
                            this.addEventListenersToReloadBtn(mineId);
                        }
                    });
                    image.dataset.listenerAdded = 'true';
                }
            });
        }

        async showTuVi(myTuVi) {
            if (!myTuVi) return;

            const buttons = document.querySelectorAll('.attack-btn');
            for (const btn of buttons) {
                if (btn.dataset.tuviAttached === '1') continue;
                btn.dataset.tuviAttached = '1';

                const userId = btn.getAttribute('data-user-id');
                if (!userId) continue;

                try {
                    const opponentTuVi = await this.getTuVi(userId);
                    if (opponentTuVi) {
                        const rate = this.winRate(myTuVi, opponentTuVi).toFixed(2);
                        this.upsertTuViInfo(btn, userId, opponentTuVi, myTuVi);
                    } else {
                        await new Promise(r => setTimeout(r, 500))
                        this.upsertTierInfo(btn, userId);
                    }
                } catch (e) {
                    console.error('getTuVi error', e);
                }

                const mineId = btn.getAttribute('data-mine-id');
                if (mineId && mineId !== this.currentMineId) {
                    this.currentMineId = mineId;
                    this.showTotalEnemies(mineId);
                    this.addEventListenersToReloadBtn(mineId);
                }
                // nghỉ 1s tránh spam
                await new Promise(r => setTimeout(r, 1000));
            }
        }

        async startUp() {
            if (document.readyState === 'loading') {
                await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve, { once: true }));
            }
            this.nonceGetUserInMine = await this.getNonceGetUserInMine();
            this.nonce = await this.getNonce();
            await this.waitForElement('#head_manage_acc', 15000);

            const getMyTuVi = async () => {
                const v = await this.getSelfTuVi(true);
                return v;
            };

            const firstTuVi = await getMyTuVi();
            if (firstTuVi) {
                await this.showTuVi(firstTuVi);
            }

            // quan sát DOM để cập nhật khi các nút attack xuất hiện hoặc nội dung thay đổi
            let __timeout = null;
            const observer = new MutationObserver(() => {
                clearTimeout(__timeout);
                __timeout = setTimeout(async () => {
                    const latest = await getMyTuVi();
                    await this.showTuVi(latest);
                }, 200);
            });
            observer.observe(document.body, { childList: true, subtree: true });

            this.addEventListenersToMines();
            // MutationObserver chính để thêm listener cho các mỏ mới
            const mainObserver = new MutationObserver(() => {
                this.addEventListenersToMines();
            });

            mainObserver.observe(document.body, { childList: true, subtree: true });
        }
    }
    // ===============================================
    // Bộ lọc tông môn
    // ===============================================
    async function getDivContent(url, selector) {
        const logPrefix = '[HH3D Auto]';

        console.log(`${logPrefix} ▶️ Đang tải trang từ ${url} để lấy nội dung...`);
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const html = await response.text();

            // Sử dụng DOMParser để phân tích mã HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // Tìm phần tử bằng selector
            const element = doc.querySelector(selector);
            
            if (element) {
                const content = element.innerHTML;
                console.log(`${logPrefix} ✅ Đã trích xuất thành công nội dung: ${content}`);
                return content;
            } else {
                console.error(`${logPrefix} ❌ Không tìm thấy phần tử với bộ chọn: ${selector}`);
                return null;
            }
        } catch (e) {
            console.error(`${logPrefix} ❌ Lỗi khi tải trang hoặc trích xuất nội dung:`, e);
            return null;
        }
    }

    // ⭐ HÀM LẤY ID TÔNG MÔN TỪ URL ẢNH
    async function getTongMonId(url) {
        const logPrefix = '[HH3D Auto]';
        // console.log(`${logPrefix} ▶️ Đang lấy ID tông môn từ ${url}...`);
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const html = await response.text();

            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // Tìm ảnh tông môn trong link: <img src=".../group-image/628390.jpg?t=...">
            const link = doc.querySelector('.tm-guild-avatar-link');
            
            if (link) {
                const img = link.querySelector('img');
                if (img && img.src) {
                    // Extract ID từ URL ảnh: .../group-image/628390.jpg → 628390
                    const match = img.src.match(/\/group-image\/(\d+)\.jpg/);
                    if (match && match[1]) {
                        const tongMonId = match[1];
                        // console.log(`${logPrefix} ✅ Đã lấy ID tông môn: ${tongMonId}`);
                        
                        // Lấy tên tông môn từ alt của img
                        localStorage.setItem('tm_name', img.alt ? img.alt.trim() : 'Không rõ');
                        console.log(`${logPrefix} 🏷️ Tên tông môn: ${img.alt} = ${localStorage.getItem('tm_name')}`);
                        
                        return tongMonId;
                    }
                }
            }                        
            console.error(`${logPrefix} ❌ Không tìm thấy ID tông môn`);
            return null;
        } catch (e) {
            console.error(`${logPrefix} ❌ Lỗi khi lấy ID tông môn:`, e);
            return null;
        }
    }

    async function kiemTraIdTong(tongMonId) {
        try {
            // Gọi GitHub để lấy danh sách ID tông môn hợp lệ: ["628390", "123456", ...]
            const response = await fetch('https://raw.githubusercontent.com/thuanhazzz/hh3d/main/tm_hop_le.json');

            if (!response.ok) {
                throw new Error(`Không thể kiểm tra tông môn: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            // Response.json() đã trả về array trực tiếp: ["628390", "123456", ...]
            if (!data || !Array.isArray(data)) {
                throw new Error("Không tìm thấy danh sách tông môn được phép.");
            }

            const danhSachTongId = data;
            // console.log(`[HH3D Auto] Danh sách ID tông môn hợp lệ đã tải: ${danhSachTongId.length} tông môn.`);
            // console.log(`[HH3D Auto] Danh sách ID tông môn: ${danhSachTongId.join(', ')}`);

            if (!tongMonId) {
                console.error('[HH3D Auto] ❌ ID tông môn trống');
                return false;
            }

            // Chuẩn hóa ID: trim và chuyển thành string
            const idChuanHoa = String(tongMonId).trim();
            // console.log(`[HH3D Auto] ID tông môn sau khi chuẩn hóa: "${idChuanHoa}"`);
            // Kiểm tra tồn tại - so sánh trực tiếp với danh sách ID (as string)
            const isExist = danhSachTongId.some(id => String(id) === idChuanHoa);
            // console.log(`[HH3D Auto] Kết quả kiểm tra: ID "${idChuanHoa}" ${isExist ? 'TÌM THẤY' : 'KHÔNG TÌM THẤY'} trong danh sách`);

            return isExist;

        } catch (error) {
            console.error('Lỗi khi kiểm tra tông:', error);
            return false;
        }
    }

    async function checkTongMon() {
        // Lấy ID tông môn từ URL ảnh (628390.jpg) thay vì tên
        const tongMonId = await getTongMonId(weburl + 'danh-sach-thanh-vien-tong-mon?t=' + Date.now());
        // console.log(`[HH3D Auto] ID tông môn hiện tại: ${tongMonId}`);
        
        if (!tongMonId) {
            console.error('[HH3D Auto] ❌ Không lấy được ID tông môn');
            return false;
        }

        const isValid = await kiemTraIdTong(tongMonId);
        console.log(`[HH3D Auto] Tông môn ${isValid ? 'hợp lệ' : 'không hợp lệ'}.`);
        
        if (isValid) {
            return true;
        } else {
            // Xóa menu nếu tông môn không hợp lệ
            const menuWrapper = document.querySelector('.custom-script-item-wrapper');
            if (menuWrapper) {
                menuWrapper.remove();
                console.log('[HH3D Auto] 🗑️ Đã xóa menu do tông môn không hợp lệ');
            }
            // showNotification("[HH3D Auto] ⚠️ Tông môn không hợp lệ. Không thể tiếp tục sử dụng script.", "error", 10000);
            return false;
        } 
    }


       
        // ===============================================
        // KHỞI ĐỘNG CHƯƠNG TRÌNH
        // ===============================================
        // if(await checkTongMon()) {
        //     console.log("[HH3D Auto] ✅ Tông môn hợp lệ, tiếp tục khởi động script...");
        //     showNotification("[HH3D Auto] ✅ Tông môn hợp lệ, tiếp tục khởi động script...", "success");
        // } else {
        //     console.warn("[HH3D Auto] ⚠️ Tông môn không hợp lệ, vui lòng tham gia tông môn hợp lệ để sử dụng script.");
        //     showNotification("[HH3D Auto] ⚠️ Tông môn không hợp lệ, vui lòng tham gia tông môn hợp lệ để sử dụng script.", "error", 10000);
        //     return; // Dừng khởi động script nếu tông môn không hợp lệ
        // }


        // ......
        // nếu xóa phần check tông môn thì gọi riêng phần lấy ID tông môn để lưu tên tông môn vào localStorage và hiển thị ở UI
        await getTongMonId(weburl + 'danh-sach-thanh-vien-tong-mon?t=' + Date.now());
        // ......

        // ===============================================
        // KHỞI TẠO SCRIPT
        // ===============================================
        const taskTracker = new TaskTracker();
        const accountId = await getAccountId();
        if (accountId) {
            let accountData = taskTracker.getAccountData(accountId);
            // console.log(`[HH3D] ✅ Account ID: ${accountId}`);
            // console.log(`[HH3D] ✅ Đã lấy dữ liệu tài khoản: ${JSON.stringify(accountData)}`);
        } else {
            console.warn("[HH3D] ⚠️ Không thể lấy ID tài khoản.");
        }

        const securityToken = await getSecurityToken();
        if (!securityToken) {
            showNotification("[HH3D] ⚠️ Không thể lấy security token.", "error");
        }

        // Khởi tạo các class
        const vandap = new VanDap();
        const dothach = new DoThach();
        const hoangvuc = new HoangVuc();
        // const luanvo = new LuanVo();
        const bicanh = new BiCanh();
        const bicanhhiente = new BiCanhHienTe();
        const khoangmach = new KhoangMach();
        const hienTuviKM = new hienTuviKhoangMach();
        const hoatdongngay = new HoatDongNgay();
        const tanghoa = new TangHoa();
        // await tanghoa.init();

        const hvmuaruong = new HoangVucShop();
        const khactran = new KhacTranVan();
        const dantong = new DanTongShop();
        const dantubao = new DanTuBaoShop();

        // Khởi tạo và chạy UI
        const uiStyles = new UIMenuStyles();
        uiStyles.addStyles();

        const createUI = new UIInitializer(".load-notification.relative", LINK_GROUPS, accountId);
        createUI.start();

        const tienduyen = new TienDuyen();
        //await tienduyen.init();

        const automatic = new AutomationManager();
        window.hh3dAutomatic = automatic; // Save to window for access from UI
        window.isRunning = null; // null = chưa chạy, true = đang chạy, false = đã dừng

        // Đợi 1000ms để UI ổn định
        await new Promise(resolve => setTimeout(resolve, 1000));

        automatic.checkAndStart();
        if (location.pathname.includes("khoang-mach") || location.href.includes("khoang-mach")) {            
            hienTuviKM.startUp();
        }
})();




