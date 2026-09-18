const API_BASE_URL = "https://t-choob-ai-api-api.vercel.app";

const state = { conversations: [], currentId: null, attachments: [], generating: false };
const el = {
	list: document.getElementById("conversation-list"),
	messages: document.getElementById("messages"),
	welcome: document.getElementById("welcome"),
	input: document.getElementById("message-input"),
	form: document.getElementById("composer"),
	send: document.getElementById("send-btn"),
	fileInput: document.getElementById("file-input"),
	attach: document.getElementById("attach-btn"),
	preview: document.getElementById("attachment-preview"),
	newChat: document.getElementById("new-chat-btn"),
	theme: document.getElementById("theme-btn"),
	clear: document.getElementById("clear-btn"),
	mobileMenu: document.getElementById("mobile-menu"),
	sidebar: document.getElementById("sidebar"),
	generateImage: document.getElementById("generate-image-btn")
};

function uid() {
	return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

function escapeHTML(value) {
	return String(value ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");
}

function createConversation() {
	const conversation = { id: uid(), title: "گفت‌وگوی جدید", messages: [], createdAt: Date.now() };
	state.conversations.unshift(conversation);
	state.currentId = conversation.id;
	save();
	renderAll();
	return conversation;
}

function currentConversation() {
	return state.conversations.find(item => item.id === state.currentId);
}

function save() {
	localStorage.setItem("tchoob-ai-conversations", JSON.stringify(state.conversations));
	localStorage.setItem("tchoob-ai-current", state.currentId || "");
}

function load() {
	try { state.conversations = JSON.parse(localStorage.getItem("tchoob-ai-conversations") || "[]"); }
	catch { state.conversations = []; }
	state.currentId = localStorage.getItem("tchoob-ai-current") || state.conversations[0]?.id || null;
	if (!state.currentId || !currentConversation()) { createConversation(); return; }
	renderAll();
}

function renderConversations() {
	el.list.innerHTML = state.conversations.map(c => `
		<button class="conversation-item${c.id === state.currentId ? " active" : ""}" type="button" data-id="${escapeHTML(c.id)}">
			<strong>${escapeHTML(c.title)}</strong>
			<small>${escapeHTML((c.messages.at(-1)?.content || "گفت‌وگوی جدید").slice(0,45))}</small>
		</button>
	`).join("");

	el.list.querySelectorAll(".conversation-item").forEach(button => {
		button.addEventListener("click", () => {
			state.currentId = button.dataset.id;
			save(); renderAll(); el.sidebar.classList.remove("open");
		});
	});
}

function formatText(text) {
	return escapeHTML(text)
		.replace(/```([\s\S]*?)```/g, "<pre>$1</pre>")
		.replace(/\n/g, "<br>");
}

function renderMessages() {
	const conversation = currentConversation();
	if (!conversation || !conversation.messages.length) {
		el.messages.innerHTML = "";
		el.messages.appendChild(el.welcome);
		el.welcome.style.display = "";
		return;
	}

	el.welcome.style.display = "none";
	el.messages.innerHTML = conversation.messages.map(message => {
		const user = message.role === "user";
		const attachments = (message.attachments || []).map(file => {
			if (file.type?.startsWith("image/") && file.dataUrl) {
				return `<div class="attachment-card"><img class="generated-image" src="${file.dataUrl}" alt="${escapeHTML(file.name)}"><div>${escapeHTML(file.name)}</div></div>`;
			}
			return `<div class="attachment-card">📎 ${escapeHTML(file.name)}</div>`;
		}).join("");

		return `<div class="message-row ${user ? "user" : "assistant"}">
			<div class="message-avatar">${user ? "ش" : "T"}</div>
			<div class="message-bubble">${formatText(message.content || "")}${attachments}</div>
		</div>`;
	}).join("");

	el.messages.scrollTop = el.messages.scrollHeight;
}

function renderAll() { renderConversations(); renderMessages(); }

function setTyping(show) {
	document.getElementById("typing-row")?.remove();
	if (!show) return;
	const row = document.createElement("div");
	row.id = "typing-row"; row.className = "message-row assistant";
	row.innerHTML = `<div class="message-avatar">T</div><div class="message-bubble"><div class="typing"><span></span><span></span><span></span></div></div>`;
	el.messages.appendChild(row);
	el.messages.scrollTop = el.messages.scrollHeight;
}

function autoResize() {
	el.input.style.height = "auto";
	el.input.style.height = Math.min(el.input.scrollHeight,180) + "px";
}

function renderAttachmentPreview() {
	el.preview.innerHTML = state.attachments.map((file,index) => `
		<div class="preview-item">
			${file.type.startsWith("image/") && file.dataUrl ? `<img src="${file.dataUrl}" alt="">` : "📎"}
			<span>${escapeHTML(file.name)}</span>
			<button class="preview-remove" type="button" data-index="${index}">×</button>
		</div>
	`).join("");

	el.preview.querySelectorAll(".preview-remove").forEach(button => button.addEventListener("click", () => {
		state.attachments.splice(Number(button.dataset.index),1);
		renderAttachmentPreview();
	}));
}

function readFile(file) {
	return new Promise((resolve,reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve({name:file.name,type:file.type || "application/octet-stream",size:file.size,dataUrl:reader.result});
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});
}

async function addFiles(fileList) {
	const files = Array.from(fileList);
	if (state.attachments.length + files.length > 5) {
		alert("حداکثر ۵ فایل را هم‌زمان می‌توانی ارسال کنی.");
		return;
	}
	for (const file of files) {
		if (file.size > 10 * 1024 * 1024) {
			alert(`فایل «${file.name}» بزرگ‌تر از ۱۰ مگابایت است.`);
			continue;
		}
		state.attachments.push(await readFile(file));
	}
	renderAttachmentPreview();
}

async function sendMessage() {
	if (state.generating) return;
	const text = el.input.value.trim();
	if (!text && !state.attachments.length) return;

	let conversation = currentConversation() || createConversation();
	const attachments = [...state.attachments];

	conversation.messages.push({ role:"user", content:text, attachments });
	if (conversation.title === "گفت‌وگوی جدید") conversation.title = text.slice(0,35) || attachments[0]?.name || "گفت‌وگوی جدید";

	el.input.value = ""; state.attachments = []; renderAttachmentPreview(); autoResize(); save(); renderAll();
	state.generating = true; el.send.disabled = true; setTyping(true);

	try {
		const response = await fetch(`${API_BASE_URL}/api/chat`, {
			method:"POST", headers:{"Content-Type":"application/json"},
			body:JSON.stringify({messages:conversation.messages})
		});
		const data = await response.json();
		if (!response.ok) throw new Error(data.error || "خطا در ارتباط با سرور.");
		conversation.messages.push({role:"assistant",content:data.answer || "پاسخی دریافت نشد."});
	} catch (error) {
		console.error(error);
		conversation.messages.push({role:"assistant",content:"در ارتباط با سرویس هوش مصنوعی مشکلی پیش آمد. آدرس API و تنظیمات Vercel را بررسی کن."});
	} finally {
		save(); state.generating = false; el.send.disabled = false; setTyping(false); renderAll();
	}
}

async function generateImage() {
	if (state.generating) return;
	const prompt = el.input.value.trim();
	if (!prompt) { alert("اول توضیح تصویر را بنویس."); el.input.focus(); return; }

	let conversation = currentConversation() || createConversation();
	conversation.messages.push({role:"user",content:`🎨 تولید تصویر: ${prompt}`});
	el.input.value = ""; autoResize(); save(); renderAll();
	state.generating = true; el.send.disabled = true; setTyping(true);

	try {
		const response = await fetch(`${API_BASE_URL}/api/generate-image`, {
			method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({prompt})
		});
		const data = await response.json();
		if (!response.ok) throw new Error(data.error || "تولید تصویر انجام نشد.");
		conversation.messages.push({
			role:"assistant",
			content:data.revisedPrompt || "تصویر تولید شد.",
			attachments:[{name:"generated-image.png",type:"image/png",dataUrl:data.imageDataUrl}]
		});
	} catch (error) {
		conversation.messages.push({role:"assistant",content:error.message || "تولید تصویر انجام نشد."});
	} finally {
		save(); state.generating = false; el.send.disabled = false; setTyping(false); renderAll();
	}
}

function toggleTheme() {
	const dark = document.documentElement.classList.toggle("dark-mode");
	localStorage.setItem("tchoob-ai-theme",dark ? "dark" : "light");
	el.theme.textContent = dark ? "حالت روشن" : "حالت تاریک";
}

function applyTheme() {
	const dark = localStorage.getItem("tchoob-ai-theme") === "dark";
	document.documentElement.classList.toggle("dark-mode",dark);
	el.theme.textContent = dark ? "حالت روشن" : "حالت تاریک";
}

el.form.addEventListener("submit", e => { e.preventDefault(); sendMessage(); });
el.input.addEventListener("input", autoResize);
el.input.addEventListener("keydown", e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }});
el.attach.addEventListener("click", () => el.fileInput.click());
el.fileInput.addEventListener("change", async () => { await addFiles(el.fileInput.files); el.fileInput.value = ""; });
el.generateImage.addEventListener("click", generateImage);
el.newChat.addEventListener("click", createConversation);
el.theme.addEventListener("click", toggleTheme);
el.clear.addEventListener("click", () => {
	if (!confirm("همه گفت‌وگوها پاک شوند؟")) return;
	localStorage.removeItem("tchoob-ai-conversations"); localStorage.removeItem("tchoob-ai-current");
	state.conversations=[]; state.currentId=null; createConversation();
});
el.mobileMenu.addEventListener("click", () => el.sidebar.classList.toggle("open"));
document.querySelectorAll(".suggestions button").forEach(button => button.addEventListener("click", () => {
	el.input.value = button.dataset.prompt; autoResize(); el.input.focus();
}));

applyTheme();
load();
