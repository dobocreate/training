function delete_task(task_id) {

    let target_project_id = task_id.replace('del_btn_','task_');
    let del_target = document.getElementById(target_project_id);
    console.log(del_target);
    del_target.remove();
    console.log('deleted');
   
}

function delete_done_task(task_id) {

    console.log('確認');
    let target_project_id = task_id.replace('del_btn_','done_task_');
    let del_target = document.getElementById(target_project_id);
    del_target.remove();
    console.log('deleted');
   
}

function move_task(task2_id) {

    let target2_project_id = task2_id.replace('complete_btn_','task_');
    let target2_clone = document.getElementById(target2_project_id);
    let target2 = target2_clone.cloneNode(true);
    console.log(target2);
    target2.id = 'done_' + target2_project_id;
    let target2_complete_btn = task2_id; 
    let target2_delete_btn = task2_id.replace('complete_btn_','del_btn_');
    console.log('target2_delete_botan :'+target2_delete_btn);
    let completed_task = document.getElementById('completed_task');
    completed_task.appendChild(target2);
    target2_clone.remove();
    console.log(document.getElementById(target2_delete_btn));
    document.getElementById(target2_delete_btn).addEventListener('click',() => delete_done_task(target2_delete_btn));
    document.getElementById(target2_complete_btn).addEventListener('click',() => restore_task(target2.id));
    
    // let target3_clone = document.getElementById(target2.id);
    // console.log(target3_clone);
}

function restore_task(task3_id) {

    // console.log(task3_id);
    // console.log(document);
    let target3_project_id = task3_id.replace('complete_btn_','done_task_');
    // let target3_clone = document.getElementById(target3_project_id);
    let target3_clone = document.getElementById(task3_id);
    console.log(target3_clone);
    let target3 = target3_clone.cloneNode(true);
    console.log(target3);
    target3.id = target3_project_id.replace('done_','');
    let target3_complete_btn = task3_id; 
    let target3_delete_btn = task3_id.replace('complete_btn_','del_btn_');
    console.log(target3_delete_btn);
    let completed_task = document.getElementById('imcomplete_task');
    completed_task.appendChild(target3);
    target3_clone.remove();
    document.getElementById(target3_delete_btn).addEventListener('click',() => delete_task(target3_delete_btn));
    document.getElementById(target3_complete_btn).addEventListener('click',() => move_task(target3_complete_btn));
   
}



function make_task() {

    project_name = model_name.value;
    project_id = model_id.value;

    let div_element = document.createElement('div');
    div_element.className = 'task_' + project_id;
    div_element.id = 'task_' + project_id;
    // const div_id = div_element.id;

    let p_element = document.createElement('p');
    p_element.textContent = project_name;
    console.log(project_name);
    console.log(project_id);

    let btn_element = document.createElement('button');
    btn_element.textContent = '削除';
    btn_element.id = 'del_btn_' + project_id;

    let btn2_element = document.createElement('button');
    btn2_element.textContent = '完了';
    btn2_element.id = 'complete_btn_' + project_id;

    div_element.appendChild(p_element);
    div_element.appendChild(btn_element);
    div_element.appendChild(btn2_element);

    let imcomplete_task = document.getElementById('imcomplete_task');
    imcomplete_task.appendChild(div_element);

    document.getElementById(btn_element.id).addEventListener('click',() => delete_task(btn_element.id));
    document.getElementById(btn2_element.id).addEventListener('click',() => move_task(btn2_element.id));

}

model_add_button.onclick = make_task;








