package doc.test3;

import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.util.logging.Logger;

public class Server {

    HttpServer httpServer;
    Handler handler;

    static Logger log = Logger.getLogger(Server.class.getName());

    public static void main(String[] args) {
        Server server = new Server();
        server.createContexts();
        server.start();

        log.info("Server started.");
    }

    public Server() {
        try {
            httpServer = HttpServer.create(new InetSocketAddress("localhost", 80), 0);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        handler = new Handler();
    }

    void createContexts() {
        httpServer.createContext("/", handler::root);
        httpServer.createContext("/api/", handler::api);
    }

    void start() {
        httpServer.start();
    }

}
