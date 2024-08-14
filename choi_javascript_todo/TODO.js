//버튼을 클릭했을때, 이벤트 발생
document.getElementsByClassName("input-button")[0].addEventListener('click',InputText );
document.getElementsByClassName("input-button")[0].addEventListener('click',Createlist); 
let AddText;
//검색창에 등록한 정보를 객체화 하는 함수
function InputText(){
      AddText = document.getElementsByClassName("text")[0].value ;
     document.getElementsByClassName("text")[0].value = ""; //초기화
     console.log("1");
     return AddText}

// const TODOlist = document.createElement('div');
// const DoButton = document.createElement('button');

// DoButton.className="DoButton";

// DoButton.append("Do")
// TODOlist.className="TODO_BOX" ;


// TODOlist.append(AddText);
// TODOlist.appendChild(DoButton);


 

 let TODOlist;
 let DeleatButton;

 function Createlist()
 {
 const template = document.getElementsByClassName("todo-item")[0]
 TODOlist = template.cloneNode(true)
 
 const text =TODOlist.querySelector('.todo-text');
 text.append(AddText);

 DeleatButton = TODOlist.querySelector('.DeleatButton');
 

  
 
 document.getElementsByClassName("TODO-area")[0].appendChild(TODOlist);
 console.log("2");


 

 
 };
 

  

 let N = 0;  // 인덱스 초기화
 const deleteButtons = document.getElementsByClassName("DeleatButton");
 const todoItems = document.getElementsByClassName("todo-item");

 deleteButtons[1].addEventListener('click',DeleatBox(todoItems[1]))
 
 

 while (N < deleteButtons.length) {
     deleteButtons[N].addEventListener('click', function() {
         DeleatBox(todoItems[N]);
     });
     console.log("4");
     N++;
     
 }
 
 function DeleatBox(target) {
     target.remove(); // 요소를 삭제합니다.
     console.log("3");
 }




