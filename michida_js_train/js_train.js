// 未完了タスクの消去に関する関数
function delete_task(del_btn_id) {     // 未完了タスクの削除ボタンをクリックした際の処理。buttonのidを取得。

    const target_project_id = del_btn_id.replace('del_btn_', 'task_');  // ボタンのidを取得し、書き換えてタスクのブロックのidを取得
    const del_target = document.getElementById(target_project_id);
    
    // タスクの消去
    del_target.remove();

}

// 完了タスクの消去に関する関数
function delete_done_task(del_btn_id) {    // 完了タスクの削除ボタンを押した際の処理。buttonのidを取得。

    const target_project_id = del_btn_id.replace('del_btn_', 'done_task_');     // ボタンのidを取得し、書き換えてタスクのブロックのidを取得
    const del_target = document.getElementById(target_project_id);

    // タスクの消去
    del_target.remove();
   
}

// 未完了タスクを完了タスクに変更する関数
function move_task(comp_btn_id) {      // 未完了タスクの完了ボタンを押した際の処理。buttonのidを取得。

    const target_project_id = comp_btn_id.replace('complete_btn_', 'task_');   // ボタンのidを取得し、書き換えてタスクのブロックのidを取得
    
    // タスクのクローン
    const target_clone = document.getElementById(target_project_id);    
    const target = target_clone.cloneNode(true);    

    target.id = 'done_' + target_project_id;    // 完了状態にidを変更

    // 完了タスクを生成
    const completed_task = document.getElementById('completed_task');   // 完了タスクを生成する領域の情報を取得
    completed_task.appendChild(target);     

    // 元の未完了タスクを消去
    target_clone.remove();  

    // 文字を完了→戻すに
    const comp_btn_text_id = 'text_' + comp_btn_id;  // button内のp要素のidを取得
    const comp_btn_text = document.getElementById(comp_btn_text_id);
    comp_btn_text.textContent = '戻す';   

    // 生成した完了タスクのボタンにイベントを付与
    const target_complete_btn = comp_btn_id; 
    const target_delete_btn = comp_btn_id.replace('complete_btn_', 'del_btn_');     // 消去ボタンのidを取得
    document.getElementById(target_delete_btn).addEventListener('click', () => delete_done_task(target_delete_btn));
    document.getElementById(target_complete_btn).addEventListener('click', () => restore_task(target_complete_btn));
    
}

// 完了タスクを未完了タスクに戻す関数
function restore_task(comp_btn_id) {      // 完了タスクの戻るボタンを押した際の処理。buttonのidを取得。

    const target_project_id = comp_btn_id.replace('complete_btn_', 'done_task_');   // ボタンのidを取得し、書き換えてタスクのブロックのidを取得
    
    // タスクのクローン
    const target_clone = document.getElementById(target_project_id);
    const target = target_clone.cloneNode(true);
    
    target.id = target_project_id.replace('done_', '');     // 未完了状態にidを変更

    // 未完了タスクの生成
    const completed_task = document.getElementById('imcomplete_task');
    completed_task.appendChild(target);

    // タスクの消去
    target_clone.remove();
    
    // 文字を戻す→完了
    const comp_btn_text_id = 'text_' + comp_btn_id;   // button内のp要素のidを取得
    const comp_btn_text = document.getElementById(comp_btn_text_id);
    comp_btn_text.textContent = '完了';

    // 生成した未完了タスクのボタンにイベントを付与
    const target_complete_btn = comp_btn_id; 
    const target_delete_btn = comp_btn_id.replace('complete_btn_', 'del_btn_');      // 消去ボタンのidを取得
    document.getElementById(target_delete_btn).addEventListener('click', () => delete_task(target_delete_btn));
    document.getElementById(target_complete_btn).addEventListener('click', () => move_task(target_complete_btn));
   
}

// タスクを生成する関数
function make_task() {     

    project_name = filled_task.value;   // 入力内容の取得
    project_id = new Date();    // idとして時情報を取得

    filled_task.value = '';     // 入力ボックスをクリア

    // タスク情報を記述するdivを生成
    const div_element = document.createElement('div');
    div_element.className = 'task__' + project_id;
    div_element.id = 'task_' + project_id;

    // 入力された内容をpとして生成
    const p_element = document.createElement('p');
    p_element.textContent = project_name;

    //  タスクに付随する削除ボタンを生成
    const del_btn_element = document.createElement('button');
    del_btn_element.className = 'task_del_button_' + project_id;   // 削除ボタンのclass
    del_btn_element.id = 'del_btn_' + project_id;
    const del_btn_text_element = document.createElement('p');
    del_btn_text_element.className = 'task_del_btn_p_' + project_id;     // 削除ボタンのpのclass
    del_btn_text_element.textContent = '削除';
    del_btn_element.appendChild(del_btn_text_element);  // '削除'をボタンに追加

    //  タスクに付随する完了ボタンを生成
    const comp_btn_element = document.createElement('button'); 
    comp_btn_element.className = 'task_comp_button_' + project_id;   // 完了ボタンのclass
    comp_btn_element.id = 'complete_btn_' + project_id;
    const comp_btn_text_element = document.createElement('p');
    comp_btn_text_element.className = 'task_comp_btn_p_' + project_id;    // ボタンのpのclass
    comp_btn_text_element.id = 'text_complete_btn_' + project_id;   // ボタンのpのid。削除と違い、文字の変更を行う必要がありidをつける。
    comp_btn_text_element.textContent = '完了';
    comp_btn_element.appendChild(comp_btn_text_element);    // '完了'をボタンに追加
    
    // 未完了タスクを生成
    const imcomplete_task = document.getElementById('imcomplete_task');
    imcomplete_task.appendChild(div_element);

    // divに文とボタンを追加
    div_element.appendChild(p_element);
    div_element.appendChild(del_btn_element);
    div_element.appendChild(comp_btn_element);

    // ボタンにイベントを付与
    document.getElementById(del_btn_element.id).addEventListener('click', () => delete_task(del_btn_element.id));
    document.getElementById(comp_btn_element.id).addEventListener('click', () => move_task(comp_btn_element.id));

}

// 空文処理
function null_judge() {     

    if (filled_task.value) {
        make_task();        // タスク作成を実行
    } else {
        alert('タスクの水増しはやめましょう　┐(´∀｀)┌　');  // 空文ならアラート
    }

}

task_add_button.onclick = null_judge;   // 追加ボタンがクリックされた際に処理を開始
