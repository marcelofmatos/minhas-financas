# Aula 07 — Publicação e Deploy

## Objetivos da Aula

Configurar o `app.json` para produção, criar assets (ícone e splash), compilar com EAS Build e publicar na Google Play e App Store com OTA updates.

---

## O app.json — Identidade do App

O `app.json` é o documento de identidade do seu aplicativo. Ele controla tudo que não faz parte do código JavaScript: nome, versão, ícone, permissões, identificadores de plataforma.

### Campos essenciais

| Campo | O que define |
|-------|-------------|
| `name` | Nome exibido embaixo do ícone na tela do celular |
| `slug` | Identificador URL-amigável (sem espaços, sem acentos) |
| `version` | Versão exibida na loja ("1.0.0") |
| `android.package` | ID único do app no Android — usa notação de domínio invertido (`com.seunome.appname`) |
| `android.versionCode` | Número inteiro que só sobe a cada build enviado à loja (1, 2, 3…) |
| `ios.bundleIdentifier` | ID único no iOS — mesmo padrão do Android, nunca pode ser alterado após publicação |
| `ios.buildNumber` | String que sobe a cada build iOS ("1", "2"…) |

> **Por que domínio invertido?** O padrão `com.empresa.app` garante unicidade global. Qualquer pessoa no mundo pode registrar o mesmo nome de app, mas o package ID precisa ser único em toda a loja.

### Versionamento semântico

A versão visível ao usuário segue o padrão `MAJOR.MINOR.PATCH`:

```
MAJOR — mudanças incompatíveis (redesign completo, nova arquitetura)
MINOR — novas funcionalidades sem quebrar nada (nova tela, novo relatório)
PATCH — correções de bugs (crash resolvido, cálculo errado corrigido)
```

O `versionCode` (Android) e o `buildNumber` (iOS) são números internos que as lojas usam para identificar qual build é mais recente. Eles **sempre sobem** — nunca podem ser iguais ou menores que o build anterior.

---

## Ícone e Splash Screen

As lojas exigem assets em dimensões específicas. O Expo cuida de gerar os tamanhos menores a partir das imagens originais, então você só precisa fornecer as versões grandes.

| Asset | Dimensão | Formato | Uso |
|-------|----------|---------|-----|
| `icon.png` | 1024×1024 px | PNG **sem** transparência | iOS e Android |
| `adaptive-icon.png` | 1024×1024 px | PNG **com** transparência | Android (ícones adaptativos) |
| `splash.png` | 1284×2778 px | PNG | Tela de carregamento |

**Por que Android tem dois ícones?** O sistema de ícones adaptativos do Android (introduzido no Android 8) separa o fundo do ícone (definido pelo sistema/fabricante) do elemento frontal (o seu desenho). Isso permite que o launcher aplique formas diferentes (círculo, quadrado arredondado) sem distorcer o ícone.

**Splash screen:** aparece por menos de 2 segundos enquanto o app carrega. Mantenha simples — logo e fundo, sem texto desnecessário.

---

## EAS Build — Compilação na Nuvem

O Expo Application Services (EAS) compila o app nos servidores da Expo, eliminando a necessidade de ter Android Studio configurado (para Android) ou um Mac com Xcode (para iOS).

### Por que EAS em vez de `expo build`?

| | `expo build` (antigo) | EAS Build (atual) |
|---|---|---|
| Status | Depreciado desde 2023 | Recomendado oficialmente |
| Customização | Limitada | Total (bare workflow) |
| Velocidade | Lenta | Significativamente mais rápida |

### Os três perfis de build

O arquivo `eas.json` define os perfis de build. Cada perfil serve a um momento diferente do ciclo de vida:

| Perfil | Momento de uso | Formato gerado |
|--------|---------------|----------------|
| `development` | Desenvolvimento ativo — inclui ferramentas de debug | APK com Expo Dev Client |
| `preview` | Distribuição para testadores sem passar pela loja | APK instalável diretamente |
| `production` | Publicação na loja | AAB (Google Play) / IPA (App Store) |

**APK vs AAB:** O APK é o formato de instalação direta — funciona em qualquer Android. O AAB (Android App Bundle) é enviado à Google Play, que então gera APKs otimizados para cada dispositivo (menor download para o usuário final).

---

## Keystore — Assinatura do App

Todo app Android precisa ser assinado com uma chave criptográfica antes de ser distribuído. Essa chave é armazenada no **Keystore**.

- O EAS gera e armazena o Keystore automaticamente na primeira vez
- Sem o Keystore original, é impossível enviar atualizações para o mesmo app na loja
- **Guarde o Keystore em local seguro** — perder significa criar um app novo do zero

---

## Google Play — Fluxo de Publicação

A Google Play organiza a distribuição em faixas progressivas:

```
Teste Interno → Teste Fechado → Teste Aberto → Produção
```

| Faixa | Quem pode instalar | Revisão da Google | Limite |
|-------|--------------------|-------------------|--------|
| Teste interno | Lista de e-mails manual | Não | 100 pessoas |
| Teste fechado (Alpha) | Lista de e-mails / grupo | Não | 2.000 pessoas |
| Teste aberto (Beta) | Qualquer um com o link | Sim | Ilimitado |
| Produção | Todos na loja | Sim | Ilimitado |

**Por que começar pelo Teste Interno?** Porque é a única faixa sem revisão e sem limite de tempo — o app fica disponível em minutos. É ideal para validar que o build funciona antes de se comprometer com o processo de revisão.

**Taxa de desenvolvedor:** US$ 25, paga uma vez, válida para sempre. A aprovação da conta pode levar até 48 horas — crie com antecedência.

---

## App Store — Fluxo de Publicação

A Apple exige revisão humana para qualquer distribuição pública. O processo segue este caminho:

```
Build (EAS) → TestFlight (teste interno) → Revisão da Apple → App Store
```

| Etapa | Descrição |
|-------|-----------|
| EAS Build | Compila o `.ipa` nos servidores (não precisa de Mac) |
| TestFlight | Programa oficial de testes da Apple — distribui para até 10.000 usuários sem revisão pública |
| Revisão | Equipe da Apple analisa o app (1 a 3 dias úteis em média) |
| App Store | Publicação pública |

**Diferença de custo:** US$ 99/ano (contra US$ 25 único da Google). A assinatura anual é obrigatória para manter o app na loja.

### Comparativo

| | Google Play | App Store |
|---|---|---|
| Conta | US$ 25 (taxa única) | US$ 99/ano |
| Precisa de Mac? | Não | Não (com EAS Build) |
| Tempo de revisão | Horas a 1 dia | 1 a 3 dias úteis |
| Teste sem loja | APK direto | TestFlight |
| Formato | `.aab` / `.apk` | `.ipa` |

---

## OTA Updates — Atualizações sem Build

Uma das vantagens do Expo é poder atualizar o JavaScript do app **sem um novo build** e sem passar pela revisão da loja. Isso é chamado de OTA (Over-The-Air).

### Quando usar OTA vs novo build

| Tipo de mudança | OTA é suficiente? |
|-----------------|:-----------------:|
| Correção de bug em lógica JS | ✅ sim |
| Nova tela ou componente | ✅ sim |
| Mudança de cores e textos | ✅ sim |
| Nova permissão no sistema | ❌ novo build |
| Instalação de biblioteca nativa | ❌ novo build |
| Mudança de ícone ou splash | ❌ novo build |

**Por que essa limitação?** O OTA atualiza apenas o bundle JavaScript. Qualquer coisa que envolva código nativo (Java/Kotlin no Android, Swift/Obj-C no iOS) exige recompilação — e portanto novo build.

---

> **Atividade prática:** O passo a passo completo — configuração do `app.json`, criação do ícone, build com EAS e publicação na Google Play — está no [conteúdo complementar](./STEPS.md).

## Checklist de Produção

Antes de publicar, verifique cada item:

### Assets
- [ ] `icon.png` 1024×1024 sem transparência
- [ ] `adaptive-icon.png` 1024×1024 com transparência
- [ ] `splash.png` 1284×2778

### app.json
- [ ] `name` definido corretamente
- [ ] `version` definida ("1.0.0")
- [ ] `android.package` único (ex: `com.seunome.minhasfinancas`)
- [ ] `android.versionCode` = 1
- [ ] `ios.bundleIdentifier` definido

### Funcional
- [ ] App funciona sem erros no emulador
- [ ] Dados persistem ao fechar e reabrir
- [ ] Nenhum `console.log` com dados sensíveis

### Loja
- [ ] Conta de desenvolvedor criada e aprovada
- [ ] Ficha da loja preenchida (título, descrição, screenshots, categoria)
- [ ] Classificação de conteúdo respondida

---

## Referências

- [EAS Build — documentação oficial](https://docs.expo.dev/build/introduction/)
- [Publicar na Google Play com EAS](https://docs.expo.dev/submit/android/)
- [OTA Updates com eas update](https://docs.expo.dev/eas-update/introduction/)
- [app.json — todas as propriedades](https://docs.expo.dev/versions/latest/config/app/)
- [Google Play Console](https://play.google.com/console)
- [Diretrizes de revisão da App Store](https://developer.apple.com/app-store/review/guidelines/)
