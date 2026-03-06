import Koa from 'koa';
import http from 'http';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import helmet from 'koa-helmet';
import router from './routes';
import { loggerMiddleware } from './middleware/logger.middleware';
import { errorMiddleware } from './middleware/error.middleware';
import { initializeWebSocketService } from './services/websocket.service';

const app = new Koa();
const server = http.createServer(app.callback());

// 初始化 WebSocket 服务
initializeWebSocketService(server);

app.use(helmet());
app.use(cors());
app.use(loggerMiddleware);
app.use(bodyParser());
app.use(errorMiddleware);
app.use(router.routes());
app.use(router.allowedMethods());

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
