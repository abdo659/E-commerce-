(function () {
  const deepChatUrl = "https://unpkg.com/deep-chat@2.4.2/dist/deepChat.bundle.js";
  const botAvatar = "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2064%2064'%3E%3Crect%20width='64'%20height='64'%20rx='32'%20fill='%231f66d6'/%3E%3Cpath%20d='M22%2027a10%2010%200%200%201%2020%200v2h2a5%205%200%200%201%205%205v8a5%205%200%200%201-5%205H20a5%205%200%200%201-5-5v-8a5%205%200%200%201%205-5h2v-2Z'%20fill='white'/%3E%3Cpath%20d='M25%2037h.01M39%2037h.01'%20stroke='%231f66d6'%20stroke-width='5'%20stroke-linecap='round'/%3E%3Cpath%20d='M26%2043c3.6%202%208.4%202%2012%200'%20stroke='%231f66d6'%20stroke-width='3'%20stroke-linecap='round'/%3E%3Cpath%20d='M32%2014v6'%20stroke='white'%20stroke-width='4'%20stroke-linecap='round'/%3E%3Ccircle%20cx='32'%20cy='12'%20r='4'%20fill='white'/%3E%3C/svg%3E";
  const userAvatar = "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2064%2064'%3E%3Crect%20width='64'%20height='64'%20rx='32'%20fill='%23111827'/%3E%3Ccircle%20cx='32'%20cy='25'%20r='10'%20fill='white'/%3E%3Cpath%20d='M16%2052c3-10%2011-16%2016-16s13%206%2016%2016'%20fill='white'/%3E%3C/svg%3E";

  function loadDeepChat() {
    if (customElements.get("deep-chat")) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const existingScript = document.querySelector(`script[src="${deepChatUrl}"]`);
      const script = existingScript || document.createElement("script");
      script.type = "module";
      script.src = deepChatUrl;
      script.addEventListener("load", resolve, { once: true });
      script.addEventListener("error", reject, { once: true });

      if (!existingScript) {
        document.head.appendChild(script);
      }
    }).then(() => customElements.whenDefined("deep-chat"));
  }

  function icon(paths) {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
  }

  function createWidget() {
    const widget = document.createElement("section");
    widget.className = "techbot-widget";
    widget.innerHTML = `
      <div class="techbot-panel" id="techbotPanel" aria-hidden="true">
        <div class="techbot-header">
          <div class="techbot-title">
            <div>
              <strong>TechBot</strong>
              <span>Product help and support</span>
            </div>
          </div>
          <button class="techbot-close" type="button" aria-label="Close TechBot">
            ${icon("<path d='M18 6 6 18'/><path d='m6 6 12 12'/>")}
          </button>
        </div>
      </div>
      <button class="techbot-launcher" type="button" aria-label="Open TechBot" aria-controls="techbotPanel" aria-expanded="false">
        <span class="techbot-open-icon">${icon("<path d='M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z'/><path d='M9 10h6'/><path d='M9 14h4'/>")}</span>
        <span class="techbot-close-icon">${icon("<path d='M18 6 6 18'/><path d='m6 6 12 12'/>")}</span>
      </button>
    `;

    document.body.appendChild(widget);
    return widget;
  }

  function configureChat(chat) {
    chat.className = "techbot-chat";
    chat.setAttribute("connect", JSON.stringify({ url: "http://localhost:5000/api/chat", method: "POST" }));
    chat.setAttribute("introMessage", JSON.stringify({ text: "Hi, I am TechBot. Ask me for help or product suggestions." }));
    chat.setAttribute("textInput", JSON.stringify({ placeholder: { text: "Ask TechBot..." } }));
    chat.setAttribute("avatars", JSON.stringify({
      default: {
        styles: {
          avatar: { width: "34px", height: "34px" },
          container: { marginTop: "2px" }
        }
      },
      ai: {
        src: botAvatar,
        styles: { avatar: { borderRadius: "50%" } }
      },
      user: {
        src: userAvatar,
        styles: { avatar: { borderRadius: "50%" } }
      }
    }));
    chat.setAttribute("messageStyles", JSON.stringify({
      default: {
        shared: {
          bubble: {
            borderRadius: "14px",
            fontSize: "14px",
            lineHeight: "1.35"
          }
        },
        ai: {
          bubble: {
            backgroundColor: "#eef4ff",
            color: "#111827"
          }
        },
        user: {
          bubble: {
            backgroundColor: "#1f66d6",
            color: "#ffffff"
          }
        }
      }
    }));
    chat.setAttribute("style", "width:100%;height:calc(100% - 64px);border:0;");
  }

  async function mountTechBot() {
    if (document.querySelector(".techbot-widget")) return;

    const widget = createWidget();
    const panel = widget.querySelector(".techbot-panel");
    const launcher = widget.querySelector(".techbot-launcher");
    const closeButton = widget.querySelector(".techbot-close");

    const toggle = forceOpen => {
      const open = typeof forceOpen === "boolean" ? forceOpen : !widget.classList.contains("open");
      widget.classList.toggle("open", open);
      panel.setAttribute("aria-hidden", String(!open));
      launcher.setAttribute("aria-expanded", String(open));
      launcher.setAttribute("aria-label", open ? "Close TechBot" : "Open TechBot");
    };

    launcher.addEventListener("click", () => toggle());
    closeButton.addEventListener("click", () => toggle(false));

    await loadDeepChat();
    const chat = document.createElement("deep-chat");
    configureChat(chat);
    panel.appendChild(chat);
  }

  document.addEventListener("DOMContentLoaded", () => {
    mountTechBot().catch(() => {});
  });
})();
