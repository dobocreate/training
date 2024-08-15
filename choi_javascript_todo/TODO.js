//버튼을 클릭했을때, 이벤트 발생
document.getElementsByClassName("input-button")[0].addEventListener('click',InputText );


//검색창에 등록한 정보를 객체화 하는 함수
function InputText(){
       const AddText = document.getElementsByClassName("text")[0].value ;
     document.getElementsByClassName("text")[0].value = ""; //초기화
     console.log("1");

     document.getElementsByClassName("input-button")[0].addEventListener('click',Createlist(AddText)); 
     
    
         }

// const TODOlist = document.createElement('div');
// const DoButton = document.createElement('button');

// DoButton.className="DoButton";

// DoButton.append("Do")
// TODOlist.className="TODO_BOX" ;


// TODOlist.append(AddText);
// TODOlist.appendChild(DoButton);


 



 function Createlist(addtext)
 {
 const template = document.getElementsByClassName("todo-item")[0]
 const TODOlist = template.cloneNode(true)
 
 const text =TODOlist.querySelector('.todo-text');
 text.append(addtext);

 const DeleatButton = TODOlist.querySelector('.DeleatButton');
 

  
 
 document.getElementsByClassName("TODO-area")[0].appendChild(TODOlist);
 console.log("2");

 console.log(TODOlist);


//  DeleatButton.addEventListener('click',DeleatBox(TODOlist));


 

 
 };




 

  

 let N = 0;  // 인덱스 초기화
 const deleteButtons = document.getElementsByClassName("DeleatButton");
 const todoItems = document.getElementsByClassName("todo-item");

//  deleteButtons[0].addEventListener('click',DeleatBox(todoItems[0]))
 
 

 while (N < deleteButtons.length) {
     deleteButtons[N].addEventListener('click', function() {
         DeleatBox(todoItems[N]);
     });
     console.log("4");
     N++;
     
 }
 
 function DeleatBox(target) {
     document.getElementsByClassName("TODO-area")[0].removeChild(target);
     console.log("3");
 }




