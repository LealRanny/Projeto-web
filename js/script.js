const ADMIN_EMAIL = "admin@flavia.com";
const ADMIN_SENHA = "1234";

function getUsuarios() {
    const dados = localStorage.getItem("usuarios");
    return dados ? JSON.parse(dados) : [];
}

function salvarUsuarios(usuarios) {
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
}

function fazerLogin() {
    const email = document.getElementById("campoEmail").value.trim();
    const senha = document.getElementById("campoSenha").value;
    const erroDiv = document.getElementById("erroLogin");

    if (email === ADMIN_EMAIL && senha === ADMIN_SENHA) {
        erroDiv.classList.add("d-none");
        localStorage.setItem("userLogged", ADMIN_EMAIL);
        window.location.href = "agendamento-admin.html";
        return;
    }

    const usuarios = getUsuarios();
    const usuarioEncontrado = usuarios.find(function(u) {
        return u.email === email && u.senha === senha;
    });

    if (usuarioEncontrado) {
        erroDiv.classList.add("d-none");
        localStorage.setItem("userLogged", email);
        window.location.href = "agendamento.html";
    } else {
        erroDiv.classList.remove("d-none");
    }
}

function fazerCadastro() {
    const email     = document.getElementById("cadastroEmail").value.trim();
    const telefone  = document.getElementById("cadastroTelefone").value.trim();
    const senha     = document.getElementById("cadastroSenha").value;
    const confirma  = document.getElementById("cadastroConfirma").value;
    
    const erroDiv   = document.getElementById("erroCadastro");
    const sucessoDiv = document.getElementById("sucessoCadastro");

    erroDiv.classList.add("d-none");
    sucessoDiv.classList.add("d-none");

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(email)) {
        erroDiv.textContent = "Digite um e-mail válido (ex: nome@email.com).";
        erroDiv.classList.remove("d-none");
        return;
    }

    if (telefone === "") {
        erroDiv.textContent = "O telefone é obrigatório.";
        erroDiv.classList.remove("d-none");
        return;
    }

    if (senha !== confirma) {
        erroDiv.textContent = "As senhas não coincidem.";
        erroDiv.classList.remove("d-none");
        return;
    }

    if (senha.length < 6) {
        erroDiv.textContent = "A senha precisa ter pelo menos 6 caracteres.";
        erroDiv.classList.remove("d-none");
        return;
    }

    if (email === ADMIN_EMAIL) {
        erroDiv.textContent = "Esse e-mail já está em uso.";
        erroDiv.classList.remove("d-none");
        return;
    }

    const usuarios = getUsuarios();
    const jaExiste = usuarios.find(function(u) { return u.email === email; });

    if (jaExiste) {
        erroDiv.textContent = "Esse e-mail já está cadastrado.";
        erroDiv.classList.remove("d-none");
        return;
    }

    usuarios.push({ 
        email: email, 
        telefone: telefone, 
        senha: senha 
    });
    salvarUsuarios(usuarios);

    document.getElementById("formCadastro").reset();
    sucessoDiv.classList.remove("d-none");
}


function getAgendamentos() {
    const dados = localStorage.getItem("agendamentos");
    return dados ? JSON.parse(dados) : [];
}

function salvarAgendamentos(agendamentos) {
    localStorage.setItem("agendamentos", JSON.stringify(agendamentos));
}

function fazerAgendamento() {
    const userLogged = localStorage.getItem("userLogged");
    if (!userLogged) {
        window.location.href = "index.html";
        return;
    }

    const procedimento = document.getElementById("selectProcedimento").value;
    const data = document.getElementById("inputData").value;
    const hora = document.getElementById("selectHora").value;
    const erroDiv = document.getElementById("erroAgendamento");
    const sucessoDiv = document.getElementById("sucessoAgendamento");

    erroDiv.classList.add("d-none");
    sucessoDiv.classList.add("d-none");

    if (!procedimento || !data || !hora) {
        erroDiv.textContent = "Preencha todos os campos.";
        erroDiv.classList.remove("d-none");
        return;
    }

    const agendamentos = getAgendamentos();

    const horarioOcupado = agendamentos.find(function(a) {
        return a.data === data && a.hora === hora;
    });

    if (horarioOcupado) {
        erroDiv.textContent = "Este horário já está reservado. Por favor, escolha outro.";
        erroDiv.classList.remove("d-none");
        return;
    }

    agendamentos.push({
        email: userLogged,
        procedimento: procedimento,
        data: data,
        hora: hora
    });
    salvarAgendamentos(agendamentos);

    sucessoDiv.classList.remove("d-none");
    document.getElementById("formAgendamento").reset();
    carregarAgendamentos();
}

function carregarAgendamentos() {
    const userLogged = localStorage.getItem("userLogged");
    if (!userLogged) return;

    const listaContainer = document.getElementById("listaAgendamentos");
    if (!listaContainer) return;

    listaContainer.innerHTML = "";
    const agendamentos = getAgendamentos();

    // Filtra os agendamentos do usuário logado
    const agendamentosDoUsuario = agendamentos.filter(function(a) {
        return a.email === userLogged;
    });

    if (agendamentosDoUsuario.length === 0) {
        listaContainer.innerHTML = `
            <div class="text-center text-muted py-4">
                <p>Você não tem agendamentos marcados.</p>
            </div>
        `;
        return;
    }

    // Ordenar por data e hora
    agendamentosDoUsuario.sort(function(a, b) {
        return new Date(`${a.data}T${a.hora}`) - new Date(`${b.data}T${b.hora}`);
    });

    agendamentosDoUsuario.forEach(function(a) {
        const dataFormatada = a.data.split("-").reverse().join("/");
        const card = document.createElement("div");
        card.className = "card card-agendamento-info p-3 mb-3 border-0 shadow-sm";
        card.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h5 class="mb-1" style="font-weight: 700; color: var(--verde);">${a.procedimento}</h5>
                    <p class="mb-0 text-muted" style="font-size: 15px;">
                        <span>📅 ${dataFormatada}</span>
                        <span class="ms-3">⏰ ${a.hora}</span>
                    </p>
                </div>
            </div>
        `;
        listaContainer.appendChild(card);
    });
}

function carregarAdminPanel() {
    const userLogged = localStorage.getItem("userLogged");
    if (userLogged !== ADMIN_EMAIL) {
        window.location.href = "index.html";
        return;
    }

    const listaClientes = document.getElementById("listaClientesAdmin");
    const listaAgendamentos = document.getElementById("listaAgendamentosAdmin");

    if (listaClientes) {
        listaClientes.innerHTML = "";
        const usuarios = getUsuarios();

        if (usuarios.length === 0) {
            listaClientes.innerHTML = `
                <div class="text-center text-muted py-4">
                    <p>Nenhum cliente cadastrado.</p>
                </div>
            `;
        } else {
            usuarios.forEach(function(u) {
                const card = document.createElement("div");
                card.className = "card card-agendamento-info p-3 mb-3 border-0 shadow-sm";
                card.innerHTML = `
                    <h5 class="mb-1" style="font-weight: 700; color: var(--verde);">${u.email}</h5>
                    <p class="mb-0 text-muted" style="font-size: 15px;">📞 Tel: ${u.telefone || 'Não informado'}</p>
                `;
                listaClientes.appendChild(card);
            });
        }
    }

    if (listaAgendamentos) {
        listaAgendamentos.innerHTML = "";
        const agendamentos = getAgendamentos();

        if (agendamentos.length === 0) {
            listaAgendamentos.innerHTML = `
                <div class="text-center text-muted py-4">
                    <p>Nenhum agendamento marcado.</p>
                </div>
            `;
        } else {
            // Ordenar por data e hora
            agendamentos.sort(function(a, b) {
                return new Date(`${a.data}T${a.hora}`) - new Date(`${b.data}T${b.hora}`);
            });

            agendamentos.forEach(function(a) {
                const dataFormatada = a.data.split("-").reverse().join("/");
                const card = document.createElement("div");
                card.className = "card card-agendamento-info p-3 mb-3 border-0 shadow-sm";
                card.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h5 class="mb-1" style="font-weight: 700; color: var(--verde);">${a.procedimento}</h5>
                            <p class="mb-1 text-muted" style="font-size: 14px;"><strong>Cliente:</strong> ${a.email}</p>
                            <p class="mb-0 text-muted" style="font-size: 14px;">📅 ${dataFormatada} às ⏰ ${a.hora}</p>
                        </div>
                    </div>
                `;
                listaAgendamentos.appendChild(card);
            });
        }
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const campoSenha = document.getElementById("campoSenha");
    if (campoSenha) {
        campoSenha.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                fazerLogin();
            }
        });
    }

    const path = window.location.pathname;
    const userLogged = localStorage.getItem("userLogged");

    if (path.includes("agendamento.html") || path.includes("agendamento-admin.html")) {
        if (!userLogged) {
            window.location.href = "index.html";
            return;
        }

        if (path.includes("agendamento.html")) {
            carregarAgendamentos();
        }

        if (path.includes("agendamento-admin.html")) {
            carregarAdminPanel();
        }
    }
});