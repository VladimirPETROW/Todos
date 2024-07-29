package doc.test3;

import com.sun.net.httpserver.HttpExchange;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.logging.Level;
import java.util.logging.Logger;

public class Handler {

    HttpClient client;

    static Logger log = Logger.getLogger(Handler.class.getName());

    public Handler() {
        client = HttpClient.newBuilder().build();
    }

    ByteArrayOutputStream readBytes(InputStream input) throws IOException {
        ByteArrayOutputStream bytes = new ByteArrayOutputStream(input.available());
        int size = 1024;
        byte[] buffer = new byte[size];
        int count;
        while ((count = input.read(buffer)) > 0) {
            bytes.write(buffer, 0, count);
        }
        return bytes;
    }

    void sendText(int code, String text, HttpExchange exchange) throws IOException {
        byte[] bytes = text.getBytes();
        exchange.sendResponseHeaders(code, bytes.length);
        OutputStream out = exchange.getResponseBody();
        out.write(bytes);
        out.close();
    }

    String createMessage(int code) {
        String message = "";
        switch (code) {
            case 400:
                message = "Bad Request";
                break;
        }
        return message;
    }

    void root(HttpExchange exchange) throws IOException {
        int code;
        String message = null;
        resource: try {
            String start = exchange.getHttpContext().getPath();
            String request = exchange.getRequestURI().getPath();
            if (!request.startsWith(start)) {
                code = 500;
                message = "Неверный путь.";
                log.severe(message);
                break resource;
            }
            String last = request.substring(start.length());
            InputStream resource;
            ClassLoader loader = this.getClass().getClassLoader();
            if (last.isEmpty()) {
                resource = loader.getResourceAsStream("todo.html");
            } else {
                resource = loader.getResourceAsStream("static/" + request);
            }
            if (resource == null) {
                code = 400;
                message = createMessage(code);
                break resource;
            }
            code = 200;
            message = readBytes(resource).toString();
        }
        catch (Exception e) {
            code = 400;
            message = createMessage(code);
            log.log(Level.SEVERE, message, e);
        }
        sendText(code, message, exchange);
    }

    void api(HttpExchange exchange) throws IOException {
        HttpResponse<String> response = null;
        try {
            String method = exchange.getRequestMethod();
            String request = exchange.getRequestURI().toString();
            HttpRequest remote = HttpRequest.newBuilder()
                    .method(method, HttpRequest.BodyPublishers.noBody())
                    .uri(new URI("https://todo.doczilla.pro" + request))
                    .build();
            response = client.send(remote, HttpResponse.BodyHandlers.ofString());
        } catch (Exception e) {
            log.log(Level.SEVERE, "", e);
            int code = 400;
            String message = createMessage(code);
            sendText(code, String.format("{\"code\":%d,\"message\":\"%s\"}", code, message), exchange);
        }
        sendText(response.statusCode(), response.body(), exchange);
    }

}
