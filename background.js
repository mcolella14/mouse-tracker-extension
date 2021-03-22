var coord_list = [];

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.origin == "popup" && msg.content.action == "stop") {
    const message = {
      origin: "background",
      content: coord_list,
    };
    chrome.runtime.sendMessage(message);
    coord_list = [];
  } else coord_list.push(msg.content);
});
