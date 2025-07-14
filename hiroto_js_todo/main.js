let btn = document.getElementById("triggerButton");
btn.addEventListener(
  "click",
  function () {
    let inputContent = document.getElementById("todoInput");
    let content = inputContent.value;
    if (content === "") {
      alert("TODOを入力してください");
      return;
    }

    let listItem = document.createElement("li");
    listItem.textContent = content;

    let buttonGroup = document.createElement("div");
    buttonGroup.className = "button-group";

    let cmpbtn = document.createElement("button");
    cmpbtn.textContent = "完了";

    let rmvbtn = document.createElement("button");
    rmvbtn.textContent = "削除";

    buttonGroup.appendChild(cmpbtn);
    buttonGroup.appendChild(rmvbtn);
    listItem.appendChild(buttonGroup);
    inputContent.value = "";

    let incompleteList = document.getElementById("incompleteList");
    incompleteList.appendChild(listItem);

    rmvbtn.addEventListener("click", function () {
      listItem.remove();
    });

    cmpbtn.addEventListener("click", function () {
      let incompleteList = document.getElementById("incompleteList");
      incompleteList.removeChild(listItem);

      let completeList = document.getElementById("completeList");
      completeList.appendChild(listItem);
      cmpbtn.remove();
      rmvbtn.remove();

      let rtnbtn = document.createElement("button");
      rtnbtn.textContent = "戻す";

      let newButtonGroup = document.createElement("div");
      newButtonGroup.className = "button-group";
      newButtonGroup.appendChild(rtnbtn);
      listItem.appendChild(newButtonGroup);

      rtnbtn.addEventListener("click", function () {
        completeList.removeChild(listItem);
        incompleteList.appendChild(listItem);
        newButtonGroup.remove();

        let originalButtonGroup = document.createElement("div");
        originalButtonGroup.className = "button-group";
        originalButtonGroup.appendChild(cmpbtn);
        originalButtonGroup.appendChild(rmvbtn);
        listItem.appendChild(originalButtonGroup);
      });
    });
  },
  false
);
