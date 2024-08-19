
function make_task() {

    project_name = model_name.value;
    project_id = model_id.value;

    let div_element = document.createElement('div');
    div_element.className = 'a_task';
    div_element.id = 'task_' + project_id;

    let p_element = document.createElement('p');
    p_element.textContent = project_name;
    console.log(project_name);
    console.log(project_id);

    let btn_element = document.createElement('button');
    btn_element.textContent = '削除';
    btn_element.id = 'del_btn_' + project_id;

    let input_element = document.createElement('input');
    input_element.type = 'checkbox'; 
    input_element.id = 'project_status';
    input_element.name = 'project_status';

    let label_element = document.createElement('label');
    label_element.for = 'project_status';
    label_element.textContent = '未完了';

    div_element.appendChild(p_element);
    div_element.appendChild(btn_element);
    div_element.appendChild(input_element);
    div_element.appendChild(label_element);

    let imcomplete_task = document.getElementById('imcomplete_task');
    imcomplete_task.appendChild(div_element);

}


model_add_button.onclick = make_task;







