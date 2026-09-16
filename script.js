/* =========================================================
   T-Choob AI
   Frontend Chat System
========================================================= */


/* =========================================================
   STATE
========================================================= */

let conversations = [];

let activeConversationId = null;

let isGenerating = false;


/* =========================================================
   DOM
========================================================= */

const messagesElement =
	document.getElementById("messages");

const welcomeElement =
	document.getElementById("welcome");

const messageInput =
	document.getElementById("message-input");

const sendButton =
	document.getElementById("send-button");

const conversationList =
	document.getElementById("conversation-list");

const newChatButton =
	document.getElementById("new-chat");

const themeToggle =
	document.getElementById("theme-toggle");

const themeText =
	document.getElementById("theme-text");

const menuButton =
	document.getElementById("menu-button");

const sidebar =
	document.getElementById("sidebar");

const sidebarClose =
	document.getElementById("sidebar-close");

const overlay =
	document.getElementById("overlay");


/* =========================================================
   STORAGE
========================================================= */

function saveConversations() {

	localStorage.setItem(
		"tchoob-ai-conversations",
		JSON.stringify(conversations)
	);
}


function loadConversations() {

	const saved =
		localStorage.getItem(
			"tchoob-ai-conversations"
		);

	if (!saved) {
		conversations = [];
		return;
	}

	try {

		conversations =
			JSON.parse(saved);

		if (!Array.isArray(conversations)) {
			conversations = [];
		}

	} catch (error) {

		conversations = [];
	}
}


/* =========================================================
   CONVERSATION
========================================================= */

function createConversation() {

	const conversation = {

		id:
			Date.now().toString(),

		title:
			"گفتگوی جدید",

		messages:
			[]
	};

	conversations.unshift(
		conversation
	);

	activeConversationId =
		conversation.id;

	saveConversations();

	renderConversations();

	renderMessages();

	closeSidebar();
}


function getActiveConversation() {

	return conversations.find(
		conversation =>
			conversation.id === activeConversationId
	);
}


function selectConversation(id) {

	activeConversationId = id;

	saveConversations();

	renderConversations();

	renderMessages();

	closeSidebar();
}


function deleteConversation(
	event,
	id
) {

	event.stopPropagation();

	conversations =
		conversations.filter(
			conversation =>
				conversation.id !== id
		);

	if (
		activeConversationId === id
	) {

		if (conversations.length > 0) {

			activeConversationId =
				conversations[0].id;

		} else {

			activeConversationId = null;
		}
	}

	saveConversations();

	renderConversations();

	renderMessages();
}


/* =========================================================
   RENDER CONVERSATIONS
========================================================= */

function renderConversations() {

	conversationList.innerHTML = "";

	if (conversations.length === 0) {

		const empty =
			document.createElement("div");

		empty.style.padding = "20px 10px";

		empty.style.textAlign = "center";

		empty.style.fontSize = "11px";

		empty.style.color =
			"var(--text-soft)";

		empty.textContent =
			"هنوز گفتگویی وجود ندارد.";

		conversationList.appendChild(
			empty
		);

		return;
	}


	conversations.forEach(
		conversation => {

			const item =
				document.createElement("div");

			item.className =
				"conversation-item";


			if (
				conversation.id ===
				activeConversationId
			) {

				item.classList.add("active");
			}


			item.addEventListener(
				"click",
				() =>
					selectConversation(
						conversation.id
					)
			);


			const icon =
				document.createElement("div");

			icon.className =
				"conversation-icon";

			icon.textContent =
				"◌";


			const name =
				document.createElement("div");

			name.className =
				"conversation-name";

			name.textContent =
				conversation.title ||
				"گفتگوی جدید";


			const deleteButton =
				document.createElement("button");

			deleteButton.className =
				"delete-conversation";

			deleteButton.type =
				"button";

			deleteButton.textContent =
				"×";

			deleteButton.title =
				"حذف گفتگو";


			deleteButton.addEventListener(
				"click",
				event =>
					deleteConversation(
						event,
						conversation.id
					)
			);


			item.appendChild(icon);

			item.appendChild(name);

			item.appendChild(
				deleteButton
			);

			conversationList.appendChild(
				item
			);
		}
	);
}


/* =========================================================
   RENDER MESSAGES
========================================================= */

function renderMessages() {

	messagesElement.innerHTML = "";


	const conversation =
		getActiveConversation();


	if (
		!conversation ||
		conversation.messages.length === 0
	) {

		messagesElement.appendChild(
			createWelcome()
		);

		return;
	}


	conversation.messages.forEach(
		message => {

			messagesElement.appendChild(
				createMessageElement(
					message.role,
					message.content
				)
			);
		}
	);


	scrollToBottom();
}


/* =========================================================
   WELCOME
========================================================= */

function createWelcome() {

	const wrapper =
		document.createElement("div");

	wrapper.className =
		"welcome";


	const logo =
		document.createElement("div");

	logo.className =
		"welcome-logo";

	logo.textContent =
		"T";


	const title =
		document.createElement("h1");

	title.textContent =
		"سلام! من دستیار T-Choob هستم.";


	const description =
		document.createElement("p");

	description.textContent =
		"می‌تونی درباره محصولات، ایده‌ها، برنامه‌نویسی، طراحی و خیلی چیزهای دیگه با من صحبت کنی.";


	const suggestions =
		document.createElement("div");

	suggestions.className =
		"suggestions";


	const suggestionData = [

		[
			"💡",
			"برای گسترش T-Choob چه ایده‌هایی داری؟"
		],

		[
			"🚀",
			"چطور می‌توانم یک کسب‌وکار اینترنتی بهتر بسازم؟"
		],

		[
			"🎨",
			"یک ایده برای طراحی سایت T-Choob بده."
		],

		[
			"🤖",
			"چه قابلیت‌هایی می‌توانم به یک چت‌بات اضافه کنم؟"
		]
	];


	suggestionData.forEach(
		data => {

			const button =
				document.createElement("button");

			button.className =
				"suggestion";

			button.type =
				"button";


			const icon =
				document.createElement("span");

			icon.textContent =
				data[0];


			const text =
				document.createElement("span");

			text.textContent =
				data[1];


			button.appendChild(icon);

			button.appendChild(text);


			button.addEventListener(
				"click",
				() => {

					messageInput.value =
						data[1];

					sendMessage();
				}
			);


			suggestions.appendChild(
				button
			);
		}
	);


	wrapper.appendChild(logo);

	wrapper.appendChild(title);

	wrapper.appendChild(description);

	wrapper.appendChild(suggestions);


	return wrapper;
}


/* =========================================================
   MESSAGE ELEMENT
========================================================= */

function createMessageElement(
	role,
	content
) {

	const message =
		document.createElement("div");

	message.className =
		`message ${role}`;


	const messageContent =
		document.createElement("div");

	messageContent.className =
		"message-content";


	const label =
		document.createElement("div");

	label.className =
		"message-label";

	label.textContent =
		role === "user"
			? "شما"
			: "T-Choob AI";


	const bubble =
		document.createElement("div");

	bubble.className =
		"message-bubble";

	bubble.textContent =
		content;


	messageContent.appendChild(label);

	messageContent.appendChild(bubble);


	if (role === "assistant") {

		const actions =
			document.createElement("div");

		actions.className =
			"message-actions";


		const copyButton =
			document.createElement("button");

		copyButton.type =
			"button";

		copyButton.textContent =
			"کپی";


		copyButton.addEventListener(
			"click",
			() => {

				navigator.clipboard
					.writeText(content)
					.then(() => {

						copyButton.textContent =
							"کپی شد";

						setTimeout(
							() => {

								copyButton.textContent =
									"کپی";

							},
							1200
						);
					});
			}
		);


		actions.appendChild(
			copyButton
		);

		messageContent.appendChild(
			actions
		);
	}


	message.appendChild(
		messageContent
	);


	return message;
}


/* =========================================================
   SEND MESSAGE
========================================================= */

async function sendMessage() {

	if (isGenerating) {
		return;
	}


	const text =
		messageInput.value.trim();


	if (!text) {
		return;
	}


	if (!activeConversationId) {
		createConversation();
	}


	const conversation =
		getActiveConversation();


	if (!conversation) {
		return;
	}


	conversation.messages.push({

		role: "user",

		content: text
	});


	if (
		conversation.messages.length === 1
	) {

		conversation.title =
			text.length > 30
				? text.slice(0, 30) + "..."
				: text;
	}


	messageInput.value = "";

	autoResizeTextarea();

	saveConversations();

	renderConversations();

	renderMessages();


	await generateAssistantResponse(
		conversation,
		text
	);
}


/* =========================================================
   AI RESPONSE
========================================================= */

async function generateAssistantResponse(
	conversation,
	userMessage
) {

	isGenerating = true;

	sendButton.disabled = true;


	const typing =
		createTypingElement();

	messagesElement.appendChild(
		typing
	);

	scrollToBottom();


	/*
	=========================================================
	فعلاً پاسخ آزمایشی

	بعداً این قسمت را به Backend متصل می‌کنیم.
	=========================================================
	*/

	await delay(900);


	const response =
		createDemoResponse(
			userMessage
		);


	typing.remove();


	conversation.messages.push({

		role: "assistant",

		content: response
	});


	saveConversations();

	renderMessages();


	isGenerating = false;

	sendButton.disabled = false;
}


/* =========================================================
   DEMO RESPONSE
========================================================= */

function createDemoResponse(
	message
) {

	const text =
		message.toLowerCase();


	if (
		text.includes("api") ||
		text.includes("ای پی آی")
	) {

		return (
			"API به تو اجازه می‌دهد قابلیت‌های یک سرویس " +
			"را داخل سایت خودت استفاده کنی. برای T-Choob " +
			"می‌توانیم بعداً یک Backend بسازیم که درخواست " +
			"کاربر را دریافت کند و به مدل هوش مصنوعی ارسال کند."
		);
	}


	if (
		text.includes("گسترش") ||
		text.includes("ایده")
	) {

		return (
			"برای گسترش T-Choob می‌توانیم آن را از یک " +
			"فروشگاه صرف به یک پلتفرم تبدیل کنیم؛ مثلاً " +
			"دستیار هوشمند، بخش آموزش، ابزارهای آنلاین، " +
			"سیستم پیشنهاد محصول و حتی خدمات مبتنی بر هوش مصنوعی."
		);
	}


	if (
		text.includes("سایت") ||
		text.includes("طراحی")
	) {

		return (
			"می‌توانیم هویت T-Choob را از یک فروشگاه ساده " +
			"به یک برند دیجیتال تبدیل کنیم. همین چت‌بات " +
			"می‌تواند یکی از اولین بخش‌های این توسعه باشد."
		);
	}


	return (
		"این نسخه فعلاً یک نمونه اولیه از رابط T-Choob AI " +
		"است. رابط چت آماده است و مرحله بعدی می‌تواند " +
		"اتصال آن به Backend و OpenAI API باشد."
	);
}


/* =========================================================
   TYPING ELEMENT
========================================================= */

function createTypingElement() {

	const message =
		document.createElement("div");

	message.className =
		"message assistant";


	const content =
		document.createElement("div");

	content.className =
		"message-content";


	const label =
		document.createElement("div");

	label.className =
		"message-label";

	label.textContent =
		"T-Choob AI";


	const bubble =
		document.createElement("div");

	bubble.className =
		"message-bubble typing-bubble";


	for (
		let i = 0;
		i < 3;
		i++
	) {

		const dot =
			document.createElement("span");

		bubble.appendChild(dot);
	}


	content.appendChild(label);

	content.appendChild(bubble);

	message.appendChild(content);


	return message;
}


/* =========================================================
   UTILITY
========================================================= */

function delay(milliseconds) {

	return new Promise(
		resolve =>
			setTimeout(
				resolve,
				milliseconds
			)
	);
}


function scrollToBottom() {

	requestAnimationFrame(() => {

		const chatArea =
			document.querySelector(
				".chat-area"
			);

		chatArea.scrollTop =
			chatArea.scrollHeight;
	});
}


function autoResizeTextarea() {

	messageInput.style.height =
		"auto";

	messageInput.style.height =
		Math.min(
			messageInput.scrollHeight,
			150
		) + "px";
}


/* =========================================================
   THEME
========================================================= */

function applyTheme() {

	const dark =
		localStorage.getItem(
			"tchoob-ai-theme"
		) === "dark";


	document.documentElement
		.classList.toggle(
			"dark-mode",
			dark
		);


	themeText.textContent =
		dark
			? "حالت روشن"
			: "حالت تاریک";
}


function toggleTheme() {

	const dark =
		document.documentElement
			.classList.contains(
				"dark-mode"
			);


	localStorage.setItem(
		"tchoob-ai-theme",
		dark
			? "light"
			: "dark"
	);


	applyTheme();
}


/* =========================================================
   SIDEBAR MOBILE
========================================================= */

function openSidebar() {

	sidebar.classList.add(
		"open"
	);

	overlay.classList.add(
		"active"
	);
}


function closeSidebar() {

	sidebar.classList.remove(
		"open"
	);

	overlay.classList.remove(
		"active"
	);
}


/* =========================================================
   EVENTS
========================================================= */

sendButton.addEventListener(
	"click",
	sendMessage
);


newChatButton.addEventListener(
	"click",
	createConversation
);


themeToggle.addEventListener(
	"click",
	toggleTheme
);


menuButton.addEventListener(
	"click",
	openSidebar
);


sidebarClose.addEventListener(
	"click",
	closeSidebar
);


overlay.addEventListener(
	"click",
	closeSidebar
);


messageInput.addEventListener(
	"input",
	autoResizeTextarea
);


messageInput.addEventListener(
	"keydown",
	event => {

		if (
			event.key === "Enter" &&
			!event.shiftKey
		) {

			event.preventDefault();

			sendMessage();
		}
	}
);


/* =========================================================
   INITIALIZE
========================================================= */

loadConversations();

applyTheme();


if (conversations.length > 0) {

	activeConversationId =
		conversations[0].id;
}


renderConversations();

renderMessages();

autoResizeTextarea();
