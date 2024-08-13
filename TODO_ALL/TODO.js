//버튼을 클릭했을때, 이벤트 발생
document.getElementsByClassName("input-button")[0].addEventListener('click',InputText);

//검색창에 등록한 정보를 객체화 하는 함수
function InputText(){
     AddText = document.getElementsByClassName("text")[0].value ;
    document.getElementsByClassName("text")[0].value = ""; //초기화

// const TODOlist = document.createElement('div');
// const DoButton = document.createElement('button');

// DoButton.className="DoButton";

// DoButton.append("Do")
// TODOlist.className="TODO_BOX" ;


// TODOlist.append(AddText);
// TODOlist.appendChild(DoButton);


const template = document.getElementById("template");
const TODOlist = template.children[0].cloneNode(true);
 TODOlist.querySelector('.todo-text').TextContent=AddText;
 document.getElementsByClassName("TODO-area")[0].appendChild(TODOlist);


};

