# Vozz CRM — static site served by Nginx
FROM nginx:1.27-alpine

# Limpa o conteúdo padrão do Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia os arquivos do projeto
COPY . /usr/share/nginx/html/

# Config customizada (rota / → Vozz.html landing; SPA fallback opcional)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
