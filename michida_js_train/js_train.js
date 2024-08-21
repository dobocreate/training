function delete_task(del_btn) {     //未完了タスクの削除ボタンをクリックした際の処理。buttonのidを取得。

    let target_project_id = del_btn.replace('del_btn_','task_');
    let del_target = document.getElementById(target_project_id);

    del_target.remove();

}

function delete_done_task(del_btn) {    //完了タスクの削除ボタンを押した際の処理。buttonのidを取得。

    let target_project_id = del_btn.replace('del_btn_','done_task_');
    let del_target = document.getElementById(target_project_id);

    del_target.remove();
   
}

function move_task(comp_btn) {      //未完了タスクの完了ボタンを押した際の処理。buttonのidを取得。

    let target_project_id = comp_btn.replace('complete_btn_','task_');   
    let target_clone = document.getElementById(target_project_id);
    let target = target_clone.cloneNode(true);

    target.id = 'done_' + target_project_id;    //idを変更する
    let target_complete_btn = comp_btn; 
    let target_delete_btn = comp_btn.replace('complete_btn_','del_btn_');
    let completed_task = document.getElementById('completed_task');
    completed_task.appendChild(target);

    target_clone.remove();

    let comp_btn_text_id = 'text_' + comp_btn;  //文字を完了→戻すに
    let comp_btn_text = document.getElementById(comp_btn_text_id);
    comp_btn_text.textContent = '戻す';
   
    document.getElementById(target_delete_btn).addEventListener('click',() => delete_done_task(target_delete_btn));
    document.getElementById(target_complete_btn).addEventListener('click',() => restore_task(target_complete_btn));
    
}

function restore_task(comp_btn) {      //完了タスクの戻るボタンを押した際の処理。buttonのidを取得。

    let target_project_id = comp_btn.replace('complete_btn_','done_task_');

    let target_clone = document.getElementById(target_project_id);
    let target = target_clone.cloneNode(true);

    target.id = target_project_id.replace('done_','');
    let target_complete_btn = comp_btn; 
    let target_delete_btn = comp_btn.replace('complete_btn_','del_btn_');

    let completed_task = document.getElementById('imcomplete_task');
    completed_task.appendChild(target);

    target_clone.remove();

    let comp_btn_text_id = 'text_' + comp_btn;  //文字を戻す→完了
    let comp_btn_text = document.getElementById(comp_btn_text_id);
    comp_btn_text.textContent = '完了';

    document.getElementById(target_delete_btn).addEventListener('click',() => delete_task(target_delete_btn));
    document.getElementById(target_complete_btn).addEventListener('click',() => move_task(target_complete_btn));
   
}

function make_task() {      //タスクを生成する処理。buttonのidを取得。

    project_name = filled_task.value;
    project_id = new Date();
    
    filled_task.value = '';

    let div_element = document.createElement('div');
    div_element.className = 'task__' + project_id;
    div_element.id = 'task_' + project_id;

    let p_element = document.createElement('p');
    p_element.textContent = project_name;

    let btn_element = document.createElement('button');
    btn_element.className = 'task_del_button_' + project_id;   //削除ボタンのclass
    btn_element.id = 'del_btn_' + project_id;
    let btn_text_element = document.createElement('p');
    btn_text_element.className = 'task_del_btn_p_' + project_id;     //削除ボタンのpのclass
    btn_text_element.textContent = '削除';
    btn_element.appendChild(btn_text_element);

    let btn2_element = document.createElement('button'); 
    btn2_element.className = 'task_comp_button_' + project_id;   //完了ボタンのclass
    btn2_element.id = 'complete_btn_' + project_id;
    let btn2_text_element = document.createElement('p');
    btn2_text_element.className = 'task_comp_btn_p_' + project_id;    //ボタンのpのclass
    btn2_text_element.id = 'text_complete_btn_' + project_id;
    console.log(btn2_text_element.id);
    btn2_text_element.textContent = '完了';
    btn2_element.appendChild(btn2_text_element);

    div_element.appendChild(p_element);
    div_element.appendChild(btn_element);
    div_element.appendChild(btn2_element);

    let imcomplete_task = document.getElementById('imcomplete_task');
    imcomplete_task.appendChild(div_element);

    document.getElementById(btn_element.id).addEventListener('click',() => delete_task(btn_element.id));
    document.getElementById(btn2_element.id).addEventListener('click',() => move_task(btn2_element.id));

}

function null_judge() {     //空文処理。空文ならアラートを。

    if (filled_task.value) {
        make_task();        //タスク作成を実行。
    } else {
        alert('タスクの水増しはやめましょう　┐(´∀｀)┌　');
    }

}

task_add_button.onclick = null_judge;








