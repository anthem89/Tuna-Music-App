document.querySelector("#loginForm").addEventListener("submit", async (event) => {
	event.preventDefault()
	try {
		const username = document.querySelector("#username").value
		const password = document.querySelector("#password").value

		const res = await fetch("/authenticate", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ username, password })
		})

		if (res.redirected) {
			window.location.href = res.url
		} else {
			const resJson = await res.json()
			document.querySelector("#error-message").innerText = resJson.error || "Login failed"
		}
	} catch (e) {
		document.querySelector("#error-message").innerText = "Login failed"
		console.error("Error:", e.toString())
	}
})