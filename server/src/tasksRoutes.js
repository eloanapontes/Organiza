import { Router } from 'express'
import * as service from './tasksService.js'
import { requireAuth } from './auth.js'

export const tasksRouter = Router()
tasksRouter.use(requireAuth)

tasksRouter.get('/', async (req, res, next) => { try { const result = await service.listTasks(req.user.id, { status: req.query.status, area: req.query.area, search: req.query.search }); res.json({ data: result.data, meta: { count: result.data.length, source: result.source } }) } catch (error) { next(error) } })
tasksRouter.get('/:id', async (req, res, next) => { try { res.json({ data: await service.getTask(req.user.id, req.params.id) }) } catch (error) { next(error) } })
tasksRouter.post('/', async (req, res, next) => { try { res.status(201).json({ data: await service.createTask(req.user.id, req.body) }) } catch (error) { next(error) } })
tasksRouter.patch('/:id', async (req, res, next) => { try { res.json({ data: await service.updateTask(req.user.id, req.params.id, req.body) }) } catch (error) { next(error) } })
tasksRouter.delete('/:id', async (req, res, next) => { try { await service.deleteTask(req.user.id, req.params.id); res.status(204).send() } catch (error) { next(error) } })
