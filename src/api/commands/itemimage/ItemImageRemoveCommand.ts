import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ItemImageService } from '../../services/ItemImageService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { MessageException } from '../../exceptions/MessageException';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';

export class ItemImageRemoveCommand extends BaseCommand implements RpcCommandInterface<void> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ItemImageService) private itemImageService: ItemImageService
    ) {
        super(Commands.ITEMIMAGE_REMOVE);
        this.log = new Logger(__filename);
    }

    /**
     *
     * data.params[]:
     *  [0]: ItemImage.Id
     */
    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<void> {
        // find itemImage
        const itemImage = await this.itemImageService.findOne(data.params[0]);

        // find related itemInformation
        const itemInformation = itemImage.related('ItemInformation').toJSON();

        // check if item already been posted
        if (itemInformation.listingItemId) {
            throw new MessageException(`Can't delete itemImage because the item has allready been posted!`);
        }
        return this.itemImageService.destroy(data.params[0]);
    }

    public help(): string {
        return this.getName() + ' <itemImageId>\n'
            + '    <itemImageId>                   - Numeric - The ID of the image we want to remove.';
    }

}
