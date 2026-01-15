// IDs dos campos
const fields = [
  "nome","apelido","nascimento","naturalidade","endereco","email",
  "bi","telefone","noFilia","altura","pe","posicao","clube","numeroCamisa"
];

const checkboxes = Array.from(document.querySelectorAll('.checkbox input'));
const inputs = fields.map(id => document.getElementById(id)).filter(i => i); // filtra apenas os elementos existentes
const btn = document.getElementById('btnInscrever');
const messageDiv = document.getElementById('messageDiv');

btn.disabled = true;
btn.style.opacity = "0.5";
btn.style.cursor = "not-allowed";

const webAppURL = "https://script.google.com/macros/s/AKfycbxhjyI95U_OeT9OLWVgKrog_NqGdjgjdCAcf5qzcUmZvQAcAy3dLDGkaH-uVKiznGt4gg/exec";

// Criar span de erro embaixo de cada input (apenas se não existir)
inputs.forEach(input => {
  if(!input.parentNode.querySelector('.error')){
    const error = document.createElement('div');
    error.className = 'error';
    error.style.fontSize = "11px";
    error.style.marginTop = "2px";
    error.style.color = "red";
    input.parentNode.appendChild(error);
  }
});

// Função de validação individual
function validarCampo(input) {
  const id = input.id;
  const value = input.value.trim();
  const error = input.parentNode.querySelector('.error');
  let valido = true;

  switch(id) {
    case 'nome':
      if(!value){ 
        error.textContent="Por favor, insira o nome"; 
        input.parentNode.querySelector('label').style.color="#e00000"; 
        valido=false; 
      } else if(!/^[A-Za-zÀ-ÿ\s]+$/.test(value)){ 
        error.textContent="Por favor, insira o nome corretamente"; 
        input.parentNode.querySelector('label').style.color="#e00000"; 
        valido=false; 
      } else { 
        error.textContent=""; 
        input.parentNode.querySelector('label').style.color="#0009"; 
      }
      break;

    case 'apelido':
      if(!value){ 
        error.textContent="Por favor, insira o apelido"; 
        input.parentNode.querySelector('label').style.color="#e00000"; 
        valido=false; 
      } else if(!/^[A-Za-zÀ-ÿ\s]+$/.test(value)){ 
        error.textContent="Por favor, insira o apelido corretamente"; 
        input.parentNode.querySelector('label').style.color="#e00000"; 
        valido=false; 
      } else { 
        error.textContent=""; 
        input.parentNode.querySelector('label').style.color="#0009"; 
      }
      break;

    case 'endereco':
      if(!value){ 
        error.textContent="Por favor, insira o endereco"; 
        input.parentNode.querySelector('label').style.color="#e00000"; 
        valido=false; 
      } else { 
        error.textContent=""; 
        input.parentNode.querySelector('label').style.color="#0009"; 
      }
      break;

    case 'naturalidade':
      if(!value){ 
        error.textContent="Por favor, insira a naturalidade"; 
        input.parentNode.querySelector('label').style.color="#e00000"; 
        valido=false;
      } else {
        error.textContent=""; 
        input.parentNode.querySelector('label').style.color="#0009"; 
      }
      break;

    case 'email':
      if(!value){ 
        error.textContent="Por favor, insira o email"; 
        input.parentNode.querySelector('label').style.color="#e00000"; 
        valido=false; 
      } else if(!/^\S+@\S+\.\S+$/.test(value)){ 
        error.textContent="Por favor, insira um email válido"; 
        input.parentNode.querySelector('label').style.color="#e00000"; 
        valido=false;
      } else { 
        error.textContent=""; 
        input.parentNode.querySelector('label').style.color="#0009"; 
      }
      break;

    case 'nascimento':
      if(!value){ 
        error.textContent="Por favor, insira a data de nascimento"; 
        input.parentNode.querySelector('label').style.color="#e00000"; 
        valido=false; 
        break; 
      }
      const hoje = new Date();
      const nasc = new Date(value);
      const idade = hoje.getFullYear() - nasc.getFullYear() - 
        (hoje.getMonth() < nasc.getMonth() || 
        (hoje.getMonth()===nasc.getMonth() && hoje.getDate()<nasc.getDate()) ? 1 : 0);
      if(idade<18){ 
        error.textContent="Como é menor de idade, por favor contacte a comissão para validar a inscrição"; 
        input.parentNode.querySelector('label').style.color="#e00000"; 
        valido=false; 
      } else if(idade>90){ 
        error.textContent="Por favor, insira corretamente a data de nascimento"; 
        input.parentNode.querySelector('label').style.color="#e00000"; 
        valido=false; 
      } else { 
        error.textContent=""; 
        input.parentNode.querySelector('label').style.color="#0009"; 
      }
      break;

    case 'bi':
      if(!value){ 
        error.textContent="Por favor, insira o numero de BI"; 
        input.parentNode.querySelector('label').style.color="#e00000"; 
        valido=false; 
      } else if(!/^[A-Za-z0-9]+$/.test(value)){ 
        error.textContent="Número de BI inválido"; 
        input.parentNode.querySelector('label').style.color="#e00000"; 
        valido=false; 
      } else { 
        error.textContent=""; 
        input.parentNode.querySelector('label').style.color="#0009"; 
      }
      break;

    case 'telefone':
      if(!value){ 
        error.textContent="Por favor, insira o numero de telefone"; 
        input.parentNode.querySelector('label').style.color="#e00000"; 
        valido=false; 
      } else if(!/^\d+$/.test(value)){ 
        error.textContent="Por favor, insira corretamente o número de telefone"; 
        input.parentNode.querySelector('label').style.color="#e00000"; 
        valido=false; 
      } else { 
        error.textContent=""; 
        input.parentNode.querySelector('label').style.color="#0009"; 
      }
      break;

    case 'altura':
      if(!value){ 
        error.textContent="Por favor, insira a altura"; 
        input.parentNode.querySelector('label').style.color="#e00000"; 
        valido=false; 
      } else if(!/^\d\.\d{2}$/.test(value)){ 
        error.textContent="Por favor, insira a altura usando duas casas decimais, ex.: m.dd"; 
        input.parentNode.querySelector('label').style.color="#e00000"; 
        valido=false; 
      } else { 
        error.textContent=""; 
        input.parentNode.querySelector('label').style.color="#0009"; 
      }
      break;

    default:
      if(!value){ 
        error.textContent="Campo obrigatório"; 
        input.parentNode.querySelector('label').style.color="#e00000"; 
        valido=false; 
      } else { 
        error.textContent=""; 
        input.parentNode.querySelector('label').style.color="#0009"; 
      }
  }

  return valido;
}

// Validar todos campos e checkboxes
function validarTudo() {
  let tudoValido = true;
  inputs.forEach(input => { if(!validarCampo(input)) tudoValido=false; });
  if(!checkboxes.every(c=>c.checked)) tudoValido=false;

  btn.disabled = !tudoValido;
  btn.style.opacity = tudoValido ? "1" : "0.5";
  btn.style.cursor = tudoValido ? "pointer" : "not-allowed";
}

// Validar ao sair do campo
inputs.forEach(input => input.addEventListener('blur', validarTudo));
checkboxes.forEach(c => c.addEventListener('change', validarTudo));

// Submeter formulário
btn.addEventListener('click', async e=>{
  e.preventDefault();
  validarTudo();
  if(btn.disabled) return;

  messageDiv.textContent="Enviando...";
  messageDiv.style.color="blue";

  try{
    const res = await fetch(webAppURL,{
      method:"POST",
      body:JSON.stringify(
        Object.fromEntries(fields.map(id=>[id,document.getElementById(id)?.value.trim() || '']))
      )
    });
    const r = await res.json();

    if(r.status==="ok"){

      mostrarVerifyModal(document.getElementById("email").value.trim());

      

      

    } else {
      messageDiv.textContent=r.mensagem;
      messageDiv.style.color="red";
    }
  } catch{
    messageDiv.textContent="Erro de comunicação com o servidor.";
    messageDiv.style.color="red";
  }
});












// MODAL DE VERIFICAÇÃO DE EMAIL inicio
function mostrarVerifyModal(email) {
  document.getElementById("userEmail").textContent = email;
  document.getElementById("verifyModal").style.display = "flex";
}
//MODAL DE VERIFICAÇÃO DE EMAIL fim
