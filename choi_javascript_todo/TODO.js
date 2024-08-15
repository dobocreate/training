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

//ボタン制作

//  const DeleatButton = document.querySelector('.DeleatButton');
//  console.log(DeleatButton);
//  console.log(DeleatButton.parentNode);

 
//  const DeletTarget = DeleatButton.parentNode;

//  DeleatButton.addEventListener('click', function(){DeleatBox(DeletTarget);});

//  function DeleatBox(target) {
//     document.getElementById("TODO-area").removeChild(target);
//     console.log("3");
// }







 function Createlist(addtext)
 {
 const template = document.getElementById("template")
 const TODOlist = template.cloneNode(true)
 
 const text =TODOlist.querySelector('.todo-text');
 text.append(addtext);

 const CloneDeletButton = TODOlist.querySelector('.DeleatButton');

 const DeletTarget2=  TODOlist

 

 CloneDeletButton.addEventListener('click', function(){DeleatBox(DeletTarget2);});
 document.getElementById("TODO-area").appendChild(TODOlist);
 console.log("2");

 console.log(TODOlist);



 }





 



