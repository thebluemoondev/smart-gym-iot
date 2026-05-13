FROM nginx:alpine

COPY index.html /usr/share/nginx/html/index.html
COPY public/favicon.svg /usr/share/nginx/html/favicon.svg
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY css /usr/share/nginx/html/css
COPY js /usr/share/nginx/html/js

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
