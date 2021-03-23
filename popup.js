const btn = document.getElementById("toggle-recording");

chrome.storage.sync.get("isRecording", (items) => {
  console.log(items);
  if ("isRecording" in items) {
    btn.innerText = items.isRecording ? "STOP" : "START";
    console.log("isRecording from storage is " + items.isRecording);
  } else {
    console.log("isRecording not in storage");
    btn.innerText = "START";
    chrome.storage.sync.set({ isRecording: false }, () => {
      console.log("Initializing isRecording with false");
    });
  }
});

const drawCoords = (contentList, dimensions) => {
  console.log(dimensions);
  var canvas = document.createElement("canvas");
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;
  var ctx = canvas.getContext("2d");
  ctx.beginPath();
  ctx.strokeStyle = "blue";
  contentList.forEach((el, i) => {
    console.log(el);
    const { x, y } = el.coords;
    if (i == 0) {
      ctx.moveTo(x, y);
    } else if (el.action == "click") {
      rectx = x > 20 ? x - 20 : 0;
      recty = y > 20 ? y - 20 : 0;
      ctx.fillRect(rectx, recty, 20, 20);
    } else {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  });
  var imgObj = new Image();
  imgObj.src = canvas.toDataURL();
  imgObj.width = canvas.width * 0.2;
  imgObj.height = canvas.height * 0.2;
  console.log(imgObj);
  document.body.appendChild(imgObj);
};

const getDimensions = () => {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
};

chrome.runtime.onMessage.addListener(async (msg) => {
  console.log(msg);
  if (msg.origin == "background") {
    const coordsObject = {
      mouseActions: msg.content,
    };

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        function: getDimensions,
      },
      (results) => {
        const dimensions = results[0].result;
        drawCoords(coordsObject.mouseActions, dimensions);
        coordsObject.screenDimensions = dimensions;
      }
    );

    counterDiv = document.createElement("div");
    counterDiv.id = "counter-div";

    counterTitle = document.createElement("h2");
    counterTitle.innerText = "Number of Coordinates";

    counterNum = document.createElement("h4");
    counterNum.innerText = msg.content.length;

    counterDiv.appendChild(counterTitle);
    counterDiv.appendChild(counterNum);
    document.body.appendChild(counterDiv);

    copyEl = document.createElement("button");
    copyEl.id = "copy-coords";
    copyEl.innerText = "Copy Coordinates";
    copyEl.onclick = () => {
      coordTable = document.createElement("textarea");
      coordTable.innerText = JSON.stringify(coordsObject);
      document.body.appendChild(coordTable);
      coordTable.select();
      document.execCommand("copy");
      coordTable.remove();
    };
    counterDiv.appendChild(copyEl);

    document.body.appendChild(counterDiv);
  }
});

const startRecording = () => {
  document.onmousemove = (e) => {
    var mousecoords = { x: e.clientX, y: e.clientY };
    message = {
      origin: "popup",
      content: {
        action: "move",
        coords: mousecoords,
      },
    };
    chrome.runtime.sendMessage(message);
  };
  document.onclick = (e) => {
    var mousecoords = { x: e.clientX, y: e.clientY };
    message = {
      origin: "popup",
      content: {
        action: "click",
        coords: mousecoords,
      },
    };
    chrome.runtime.sendMessage(message);
  };
};

const stopRecording = () => {
  document.onmousemove = () => {};
  document.onclick = () => {};
  message = {
    origin: "popup",
    content: {
      action: "stop",
      coords: null,
    },
  };
  chrome.runtime.sendMessage(message);
};

btn.onclick = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.storage.sync.get("isRecording", (items) => {
    console.log(items);
    var isRecording = items.isRecording;
    if (!isRecording) {
      counterDiv = document.getElementById("counter-div");
      console.log(counterDiv);
      if (counterDiv) {
        counterDiv.remove();
      }
      console.log("Starting Recording");
      chrome.storage.sync.set({ isRecording: true }, () => {});
      btn.innerText = "STOP";
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: startRecording,
      });
      chrome.action.setBadgeText({ text: "REC" });
      chrome.action.setBadgeBackgroundColor({ color: "#F00" });
      window.close();
    } else {
      console.log("Stopping Recording");
      chrome.storage.sync.set({ isRecording: false }, () => {});
      btn.innerText = "START";
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: stopRecording,
      });
      chrome.action.setBadgeText({ text: "" });
      chrome.action.setBadgeBackgroundColor({ color: "#FFF" });
    }
  });
};
