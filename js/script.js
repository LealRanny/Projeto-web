const ADMIN_EMAIL = "admin@flavia.com";
const ADMIN_SENHA = "1234";

var indiceAgendamentoSelecionado = null;

function getUsuarios() {
    var dados = localStorage.getItem("usuarios");
    return dados ? JSON.parse(dados) : [];
}

function salvarUsuarios(usuarios) {
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
}

function getAgendamentos() {
    var dados = localStorage.getItem("agendamentos");
    return dados ? JSON.parse(dados) : [];
}

function salvarAgendamentos(agendamentos) {
    localStorage.setItem("agendamentos", JSON.stringify(agendamentos));
}

function fazerLogin() {
    var email = document.getElementById("campoEmail").value.trim(); 
    var senha = document.getElementById("campoSenha").value;
    var erroDiv = document.getElementById("erroLogin"); 

    if (email === ADMIN_EMAIL && senha === ADMIN_SENHA) {
        erroDiv.classList.add("d-none"); 
        localStorage.setItem("userLogged", ADMIN_EMAIL); 
        window.location.href = "agendamento-admin.html"; 
        return;
    }

    var usuarios = getUsuarios();

    var usuarioEncontrado = usuarios.find(function(u) {
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
    var email     = document.getElementById("cadastroEmail").value.trim();
    var telefone  = document.getElementById("cadastroTelefone").value.trim();
    var senha     = document.getElementById("cadastroSenha").value;
    var confirma  = document.getElementById("cadastroConfirma").value;
    
    var erroDiv   = document.getElementById("erroCadastro");   
    var sucessoDiv = document.getElementById("sucessoCadastro"); 

    erroDiv.classList.add("d-none");
    sucessoDiv.classList.add("d-none");

    var regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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

    var usuarios = getUsuarios();
    var jaExiste = usuarios.find(function(u) { return u.email === email; });

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


function fazerAgendamento() {
    var userLogged = localStorage.getItem("userLogged");
    if (!userLogged) {
        window.location.href = "index.html";
        return;
    }

    var procedimento = document.getElementById("selectProcedimento").value;
    var data = document.getElementById("inputData").value;
    var hora = document.getElementById("selectHora").value;
    var erroDiv = document.getElementById("erroAgendamento");
    var sucessoDiv = document.getElementById("sucessoAgendamento");

    erroDiv.classList.add("d-none");
    sucessoDiv.classList.add("d-none");

    if (!procedimento || !data || !hora) {
        erroDiv.textContent = "Preencha todos os campos.";
        erroDiv.classList.remove("d-none");
        return;
    }

    var agendamentos = getAgendamentos();
    var horarioOcupado = agendamentos.find(function(a) {
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
    var userLogged = localStorage.getItem("userLogged");
    if (!userLogged) return; 

    var listaContainer = document.getElementById("listaAgendamentos");
    if (!listaContainer) return;

    listaContainer.innerHTML = "";

    var agendamentos = getAgendamentos();

    var agendamentosDoUsuario = agendamentos.filter(function(a) {
        return a.email === userLogged;
    });

    if (agendamentosDoUsuario.length === 0) {
        listaContainer.innerHTML = 
            '<div class="text-center text-muted py-4">' +
                '<p>Você não tem agendamentos marcados.</p>' +
            '</div>';
        return;
    }


    agendamentosDoUsuario.sort(function(a, b) {
        return new Date(a.data + "T" + a.hora) - new Date(b.data + "T" + b.hora);
    });


    agendamentosDoUsuario.forEach(function(agendamento) {
        var dataFormatada = agendamento.data.split("-").reverse().join("/");

        var indiceReal = agendamentos.findIndex(function(a) {
            return a.email === agendamento.email && 
                   a.data === agendamento.data && 
                   a.hora === agendamento.hora && 
                   a.procedimento === agendamento.procedimento;
        });

        var card = document.createElement("div");
        card.className = "card card-agendamento-info p-3 mb-3 border-0 shadow-sm";
        card.innerHTML = 
            '<div class="d-flex justify-content-between align-items-center">' +
                '<div>' +
                    '<h5 class="mb-1" style="font-weight: 700; color: var(--verde);">' + agendamento.procedimento + '</h5>' +
                    '<p class="mb-0 text-muted" style="font-size: 15px;">' +
                        '<span>📅 ' + dataFormatada + '</span>' +
                        '<span class="ms-3">⏰ ' + agendamento.hora + '</span>' +
                    '</p>' +
                '</div>' +
                '<div class="d-flex gap-1">' +
                    '<button class="btn-acao btn-acao-editar" title="Editar" onclick="abrirModalEditarAgendamento(' + indiceReal + ')">' +
                        '✏️' +
                    '</button>' +
                    '<button class="btn-acao btn-acao-excluir" title="Excluir" onclick="abrirModalExcluirAgendamento(' + indiceReal + ')">' +
                        '🗑️' +
                    '</button>' +
                '</div>' +
            '</div>';
        
        listaContainer.appendChild(card);
    });
}

// EDITAR AGENDAMENTO

function abrirModalEditarAgendamento(indice) {

    indiceAgendamentoSelecionado = indice;
    var agendamentos = getAgendamentos();
    var agendamento = agendamentos[indice];

    document.getElementById("editSelectProcedimento").value = agendamento.procedimento;
    document.getElementById("editInputData").value = agendamento.data;
    document.getElementById("editSelectHora").value = agendamento.hora;
    document.getElementById("erroEditarAgendamento").classList.add("d-none");
    document.getElementById("sucessoEditarAgendamento").classList.add("d-none");

    var modal = bootstrap.Modal.getOrCreateInstance(document.getElementById("modalEditarAgendamento"));
    modal.show();
}

function salvarEdicaoAgendamento() {
    var novoProcedimento = document.getElementById("editSelectProcedimento").value;
    var novaData = document.getElementById("editInputData").value;
    var novaHora = document.getElementById("editSelectHora").value;
    var erroDiv = document.getElementById("erroEditarAgendamento");
    var sucessoDiv = document.getElementById("sucessoEditarAgendamento");

    erroDiv.classList.add("d-none");
    sucessoDiv.classList.add("d-none");

    if (!novoProcedimento || !novaData || !novaHora) {
        erroDiv.textContent = "Preencha todos os campos.";
        erroDiv.classList.remove("d-none");
        return;
    }

    var agendamentos = getAgendamentos();

    var conflito = agendamentos.find(function(a, i) {
        // i !== indiceAgendamentoSelecionado eh pra ele ignorar o próprio agendamento
        return i !== indiceAgendamentoSelecionado && a.data === novaData && a.hora === novaHora;
    });

    if (conflito) {
        erroDiv.textContent = "Este horário já está reservado. Escolha outro.";
        erroDiv.classList.remove("d-none");
        return;
    }

    agendamentos[indiceAgendamentoSelecionado].procedimento = novoProcedimento;
    agendamentos[indiceAgendamentoSelecionado].data = novaData;
    agendamentos[indiceAgendamentoSelecionado].hora = novaHora;

    salvarAgendamentos(agendamentos);

    sucessoDiv.classList.remove("d-none");

    setTimeout(function() {
        var modal = bootstrap.Modal.getInstance(document.getElementById("modalEditarAgendamento"));
        modal.hide();

        // window.location.pathname pega o caminho da URL pra saber qual eh a pagina
        var path = window.location.pathname;
        if (path.includes("agendamento-admin.html")) {
            carregarAdminPanel(); 
        } else {
            carregarAgendamentos();
        }
    }, 1000);
}

function abrirModalExcluirAgendamento(indice) {

    indiceAgendamentoSelecionado = indice;

    var modal = bootstrap.Modal.getOrCreateInstance(document.getElementById("modalExcluirAgendamento"));
    modal.show();
}

function confirmarExclusaoAgendamento() {
    var agendamentos = getAgendamentos();

    agendamentos.splice(indiceAgendamentoSelecionado, 1);

    salvarAgendamentos(agendamentos);

    var modal = bootstrap.Modal.getInstance(document.getElementById("modalExcluirAgendamento"));
    modal.hide();

    var path = window.location.pathname;
    if (path.includes("agendamento-admin.html")) {
        carregarAdminPanel();
    } else {
        carregarAgendamentos();
    }
}


function abrirModalEditarConta() {
    var userLogged = localStorage.getItem("userLogged");
    var usuarios = getUsuarios();

    var usuario = usuarios.find(function(u) { return u.email === userLogged; });

    if (!usuario) return;

    document.getElementById("editContaEmail").value = usuario.email;
    document.getElementById("editContaTelefone").value = usuario.telefone;

    document.getElementById("editContaSenha").value = "";
    document.getElementById("editContaConfirmaSenha").value = "";

    document.getElementById("erroEditarConta").classList.add("d-none");
    document.getElementById("sucessoEditarConta").classList.add("d-none");

    var modal = bootstrap.Modal.getOrCreateInstance(document.getElementById("modalEditarConta"));
    modal.show();
}

function salvarEdicaoConta() {
    var userLogged = localStorage.getItem("userLogged");
    var novoEmail = document.getElementById("editContaEmail").value.trim();
    var novoTelefone = document.getElementById("editContaTelefone").value.trim();
    var novaSenha = document.getElementById("editContaSenha").value;
    var confirmaSenha = document.getElementById("editContaConfirmaSenha").value;
    var erroDiv = document.getElementById("erroEditarConta");
    var sucessoDiv = document.getElementById("sucessoEditarConta");

    erroDiv.classList.add("d-none");
    sucessoDiv.classList.add("d-none");

    var regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(novoEmail)) {
        erroDiv.textContent = "Digite um e-mail válido.";
        erroDiv.classList.remove("d-none");
        return;
    }

    if (novoTelefone === "") {
        erroDiv.textContent = "O telefone é obrigatório.";
        erroDiv.classList.remove("d-none");
        return;
    }

    if (novoEmail === ADMIN_EMAIL) {
        erroDiv.textContent = "Esse e-mail não pode ser usado.";
        erroDiv.classList.remove("d-none");
        return;
    }

    if (novaSenha !== "") {
        if (novaSenha.length < 6) {
            erroDiv.textContent = "A nova senha precisa ter pelo menos 6 caracteres.";
            erroDiv.classList.remove("d-none");
            return;
        }
        if (novaSenha !== confirmaSenha) {
            erroDiv.textContent = "As senhas não coincidem.";
            erroDiv.classList.remove("d-none");
            return;
        }
    }

    var usuarios = getUsuarios();

    if (novoEmail !== userLogged) {
        var emailEmUso = usuarios.find(function(u) {
            return u.email === novoEmail;
        });
        if (emailEmUso) {
            erroDiv.textContent = "Esse e-mail já está em uso por outra conta.";
            erroDiv.classList.remove("d-none");
            return;
        }
    }

    var indiceUsuario = usuarios.findIndex(function(u) { return u.email === userLogged; });
    
    if (indiceUsuario === -1) return;

    usuarios[indiceUsuario].email = novoEmail;
    usuarios[indiceUsuario].telefone = novoTelefone;

    if (novaSenha !== "") {
        usuarios[indiceUsuario].senha = novaSenha;
    }

    salvarUsuarios(usuarios);

    // Se o e-mail mudou, precisa atualizar todos os agendamentos desse usuário
    if (novoEmail !== userLogged) {
        var agendamentos = getAgendamentos();
        
        // Percorre todos os agendamentos e troca o e-mail antigo pelo novo
        agendamentos.forEach(function(a) {
            if (a.email === userLogged) {
                a.email = novoEmail;
            }
        });
        
        salvarAgendamentos(agendamentos);

        // Atualiza o "userLogged" com o novo e-mail
        localStorage.setItem("userLogged", novoEmail);
    }

    sucessoDiv.classList.remove("d-none");

    setTimeout(function() {
        var modal = bootstrap.Modal.getInstance(document.getElementById("modalEditarConta"));
        modal.hide();
        carregarAgendamentos();
    }, 1500);
}


function abrirModalExcluirConta() {
    var modal = bootstrap.Modal.getOrCreateInstance(document.getElementById("modalExcluirConta"));
    modal.show();
}

function confirmarExclusaoConta() {
    var userLogged = localStorage.getItem("userLogged");

    // Remove todos os agendamentos deste usuário
    var agendamentos = getAgendamentos();
    // cria uma nova lista sem os agendamentos do cara
    var agendamentosFiltrados = agendamentos.filter(function(a) {
        return a.email !== userLogged; // Mantém os que NÃO são dele
    });
    salvarAgendamentos(agendamentosFiltrados);
    var usuarios = getUsuarios();
    var usuariosFiltrados = usuarios.filter(function(u) {
        return u.email !== userLogged;
    });
    salvarUsuarios(usuariosFiltrados);

    localStorage.removeItem("userLogged");

    var modal = bootstrap.Modal.getInstance(document.getElementById("modalExcluirConta"));
    modal.hide();
    window.location.href = "index.html";
}

function fazerLogout() {
    localStorage.removeItem("userLogged");
    window.location.href = "index.html";
}


function carregarAdminPanel() {
    var userLogged = localStorage.getItem("userLogged");
    if (userLogged !== ADMIN_EMAIL) {
        window.location.href = "index.html";
        return;
    }

    var listaClientes = document.getElementById("listaClientesAdmin");
    var listaAgendamentos = document.getElementById("listaAgendamentosAdmin");

    if (listaClientes) {
        listaClientes.innerHTML = ""; 
        var usuarios = getUsuarios();

        if (usuarios.length === 0) {
            listaClientes.innerHTML = 
                '<div class="text-center text-muted py-4">' +
                    '<p>Nenhum cliente cadastrado.</p>' +
                '</div>';
        } else {
            usuarios.forEach(function(u) {
                var card = document.createElement("div");
                card.className = "card card-agendamento-info p-3 mb-3 border-0 shadow-sm";
                card.innerHTML = 
                    '<h5 class="mb-1" style="font-weight: 700; color: var(--verde);">' + u.email + '</h5>' +
                    '<p class="mb-0 text-muted" style="font-size: 15px;">📞 Tel: ' + (u.telefone || 'Não informado') + '</p>';
                listaClientes.appendChild(card);
            });
        }
    }

    if (listaAgendamentos) {
        listaAgendamentos.innerHTML = "";
        var agendamentos = getAgendamentos();

        if (agendamentos.length === 0) {
            listaAgendamentos.innerHTML = 
                '<div class="text-center text-muted py-4">' +
                    '<p>Nenhum agendamento marcado.</p>' +
                '</div>';
        } else {
            agendamentos.sort(function(a, b) {
                return new Date(a.data + "T" + a.hora) - new Date(b.data + "T" + b.hora);
            });

            agendamentos.forEach(function(a, indice) {
                var dataFormatada = a.data.split("-").reverse().join("/");
                var card = document.createElement("div");
                card.className = "card card-agendamento-info p-3 mb-3 border-0 shadow-sm";
                card.innerHTML = 
                    '<div class="d-flex justify-content-between align-items-center">' +
                        '<div>' +
                            '<h5 class="mb-1" style="font-weight: 700; color: var(--verde);">' + a.procedimento + '</h5>' +
                            '<p class="mb-1 text-muted" style="font-size: 14px;"><strong>Cliente:</strong> ' + a.email + '</p>' +
                            '<p class="mb-0 text-muted" style="font-size: 14px;">📅 ' + dataFormatada + ' às ⏰ ' + a.hora + '</p>' +
                        '</div>' +
                        '<div class="d-flex gap-1">' +
                            '<button class="btn-acao btn-acao-editar" title="Editar" onclick="abrirModalEditarAgendamento(' + indice + ')">' +
                                '✏️' +
                            '</button>' +
                            '<button class="btn-acao btn-acao-excluir" title="Excluir" onclick="abrirModalExcluirAgendamento(' + indice + ')">' +
                                '🗑️' +
                            '</button>' +
                        '</div>' +
                    '</div>';
                listaAgendamentos.appendChild(card);
            });
        }
    }
}


document.addEventListener("DOMContentLoaded", function () {
    
    var campoSenha = document.getElementById("campoSenha");
    if (campoSenha) {
        campoSenha.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                fazerLogin();
            }
        });
    }

    var path = window.location.pathname;
    var userLogged = localStorage.getItem("userLogged");

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