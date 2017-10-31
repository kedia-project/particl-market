import { inject, named } from 'inversify';
import { controller, httpGet, httpPost, httpPut, httpDelete, response, requestBody, requestParam } from 'inversify-express-utils';
import { Types, Core, Targets } from '../../constants';
import { app } from '../../app';
import { LocationMarkerService } from '../services/LocationMarkerService';
import { Logger as LoggerType } from '../../core/Logger';

// Get middlewares
const restApi = app.IoC.getNamed<interfaces.Middleware>(Types.Middleware, Targets.Middleware.RestApiMiddleware);

@controller('/location-markers', restApi.use)
export class LocationMarkerController {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.LocationMarkerService) private locationMarkerService: LocationMarkerService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType) {
        this.log = new Logger(__filename);
    }

    @httpGet('/')
    public async findAll( @response() res: myExpress.Response): Promise<any> {
        const locationMarkers = await this.locationMarkerService.findAll();
        this.log.debug('findAll: ', JSON.stringify(locationMarkers, null, 2));
        return res.found(locationMarkers.toJSON());
    }

    @httpPost('/')
    public async create( @response() res: myExpress.Response, @requestBody() body: any): Promise<any> {
        const locationMarker = await this.locationMarkerService.create(body);
        this.log.debug('create: ', JSON.stringify(locationMarker, null, 2));
        return res.created(locationMarker.toJSON());
    }

    @httpGet('/:id')
    public async findOne( @response() res: myExpress.Response, @requestParam('id') id: string): Promise<any> {
        const locationMarker = await this.locationMarkerService.findOne(parseInt(id, 10));
        this.log.debug('findOne: ', JSON.stringify(locationMarker, null, 2));
        return res.found(locationMarker.toJSON());
    }

    @httpPut('/:id')
    public async update( @response() res: myExpress.Response, @requestParam('id') id: string, @requestBody() body: any): Promise<any> {
        const locationMarker = await this.locationMarkerService.update(parseInt(id, 10), body);
        this.log.debug('update: ', JSON.stringify(locationMarker, null, 2));
        return res.updated(locationMarker.toJSON());
    }

    @httpDelete('/:id')
    public async destroy( @response() res: myExpress.Response, @requestParam('id') id: string): Promise<any> {
        await this.locationMarkerService.destroy(parseInt(id, 10));
        this.log.debug('destroy: ', parseInt(id, 10));
        return res.destroyed();
    }
    // Implement your routes here
}
