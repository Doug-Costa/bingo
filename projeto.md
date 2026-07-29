

Converter o aplicativo react-native atual para um app react-native com a interface e funções do projeto next de exemplo 

este projeto eh em react-native estou aprovbeitando de um projeto antigo podemos ignorar varias coisas precisamos adaptar o projeto NEXT que esta na pasta next-frontend   para react native 

tenha os themas em next-frontend/themes
componentes compartilhados em next-frontend/shared/GameComponents.tsx

next-frontend/shared/api.ts

conectar no backend ( SSE )
next-frontend/shared/GameSocket.tsx

o objetivo eh alterar o app atual react-native  para que ele tenha a interface grafica parreceida com o projeto next com seus temas comunicação e api 

o foco eh continuar ser react-native mas com o frontend do next apenas estou reaproveitando um projeto react-native existente  o nome dele sera tvapp1

ele deve ter visualização responsiva verticval e horizontal deve ter animações cores bonitas ( ver temas ) e rodar em android

devera ter se nao logado uma tela com  senha  se digitar  102030 entra uma tela 
para configurar ip porta , e pin e botao conectar ( salvar estes dados para caso reiniciar  ) se conectar ir para o tema acionado  ...  ter fallback em .env 

