import Router from '@koa/router';
import * as authController from '../controllers/auth.controller';
import * as processController from '../controllers/process.controller';
import * as instanceController from '../controllers/instance.controller';
import * as taskController from '../controllers/task.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = new Router({ prefix: '/api/v1' });

router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

router.get('/process-definitions', authMiddleware, processController.getDefinitions);
router.post('/process-definitions', authMiddleware, processController.createDefinition);
router.put('/process-definitions/:id', authMiddleware, processController.updateDefinition);
router.post('/process-definitions/:id/publish', authMiddleware, processController.publishDefinition);
router.delete('/process-definitions/:id', authMiddleware, processController.deleteDefinition);

router.get('/process-instances', authMiddleware, instanceController.getInstances);
router.post('/process-instances', authMiddleware, instanceController.startInstance);
router.get('/process-instances/:id', authMiddleware, instanceController.getInstance);
router.post('/process-instances/:id/cancel', authMiddleware, instanceController.cancelInstance);

router.get('/tasks', authMiddleware, taskController.getTasks);
router.get('/tasks/my-pending', authMiddleware, taskController.getMyPendingTasks);
router.post('/tasks/:id/complete', authMiddleware, taskController.completeTask);
router.post('/tasks/:id/reject', authMiddleware, taskController.rejectTask);
router.post('/tasks/:id/delegate', authMiddleware, taskController.delegateTask);

export default router;
