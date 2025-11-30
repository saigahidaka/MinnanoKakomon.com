import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyD4ViHcFj-9334N1OGQR1v3dYN1RhWfzpg",
  authDomain: "minnanokakomon-c2b7f.firebaseapp.com",
  projectId: "minnanokakomon-c2b7f",
  storageBucket: "minnanokakomon-c2b7f.firebasestorage.app",
  messagingSenderId: "387571811654",
  appId: "1:387571811654:web:688b0c4203d07f4ae61147",
  measurementId: "G-3XFHGSE7FN"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// === 1. ログイン状態の監視 ===
onAuthStateChanged(auth, (user) => {
  const currentUrl = window.location.href;

  if (user) {
    // A. ログイン中
    if (currentUrl.includes("loginform.html")) {
       window.location.href = "index.html"; // ログイン済みならトップへ
       return; 
    }
    
    // 画面を表示
    document.body.style.display = "block";

    // メニューにメールアドレスを表示
    const emailDisplay = document.getElementById("user-email-display");
    if (emailDisplay) {
      emailDisplay.textContent = user.email;
    }

  } else {
    // B. ログアウト中
    
    // 「ログインしてなくても見れるページ」リスト
    const publicPages = [
        "loginform.html",     
        "introduction.html",  
        "howtouse.html"
    ];

    // 今いるページがリストに入っているかチェック
    const isPublicPage = publicPages.some(page => currentUrl.includes(page));

    if (isPublicPage) {
        // 公開ページなら表示OK
        document.body.style.display = "block";
    } else {
        // ★それ以外の秘密ページ（board.html, index.html, 都道府県ページなど）は強制送還！
        
        // 階層によって飛ばす先を変える（../が必要かどうか）
        // URLに "/prefecture/" や "/detail/" が含まれていたら深い階層にいる
        if (currentUrl.includes("/prefecture/") || currentUrl.includes("/detail/")) {
            window.location.href = "../loginform.html";
        } else {
            window.location.href = "loginform.html";
        }
    }
  }
});

// === 2. メニューとログアウトの機能（全ページ共通） ===
window.addEventListener('DOMContentLoaded', () => {
    
    const menuBtn = document.getElementById("menu-btn-toggle");
    const dropdown = document.getElementById("myDropdown");

    if(menuBtn && dropdown) {
        menuBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            dropdown.classList.toggle("show");
        });

        window.addEventListener("click", (e) => {
            if (!e.target.matches('.menu-btn') && !e.target.closest('.dropdown-menu')) {
                if (dropdown.classList.contains('show')) {
                    dropdown.classList.remove('show');
                }
            }
        });
    }

    const btnLogout = document.getElementById("menu-logout");
    if(btnLogout){
      btnLogout.addEventListener("click", async (e) => {
        e.preventDefault();
        if(confirm("ログアウトしますか？")) {
            await signOut(auth);
            // ログアウト後の移動先も階層を考慮
            if (window.location.href.includes("/prefecture/") || window.location.href.includes("/detail/")) {
                window.location.href = "../loginform.html";
            } else {
                window.location.href = "loginform.html";
            }
        }
      });
    }
});