import { IMock, Mock } from 'typemoq';
import { ImageProcessor } from '../../common/image-processor';
import { Logger } from '../../common/logger';
import { FileMetadata } from '../../common/metadata/file-metadata';
import { ExternalAlbumArtworkGetter } from './external-album-artwork-getter';
import { ExternalArtworkPathGetter } from './external-artwork-path-getter';

describe('ExternalAlbumArtworkGetter', () => {
    let externalArtworkPathGetterMock: IMock<ExternalArtworkPathGetter>;
    let imageProcessorMock: IMock<ImageProcessor>;
    let loggerMock: IMock<Logger>;
    let externalAlbumArtworkGetter: ExternalAlbumArtworkGetter;

    beforeEach(() => {
        externalArtworkPathGetterMock = Mock.ofType<ExternalArtworkPathGetter>();
        imageProcessorMock = Mock.ofType<ImageProcessor>();
        loggerMock = Mock.ofType<Logger>();

        externalAlbumArtworkGetter = new ExternalAlbumArtworkGetter(
            externalArtworkPathGetterMock.object,
            imageProcessorMock.object,
            loggerMock.object
        );
    });

    describe('getExternalArtworkAsync', () => {
        it('should return undefined if fileMetaData is undefined', async () => {
            // Arrange

            // Act
            const actualArtwork: Buffer = await externalAlbumArtworkGetter.getExternalArtworkAsync(undefined);

            // Assert
            expect(actualArtwork).toBeUndefined();
        });

        it('should return undefined if fileMetaData is not undefined and external artwork path is undefined', async () => {
            // Arrange
            const metaDataMock: IMock<FileMetadata> = Mock.ofType<FileMetadata>();
            metaDataMock.setup((x) => x.path).returns(() => '/home/MyUser/Music/track.mp3');

            externalArtworkPathGetterMock.setup((x) => x.getExternalArtworkPath('/home/MyUser/Music/track.mp3')).returns(() => undefined);

            // Act
            const actualArtwork: Buffer = await externalAlbumArtworkGetter.getExternalArtworkAsync(metaDataMock.object);

            // Assert
            expect(actualArtwork).toBeUndefined();
        });

        it('should return undefined if fileMetaData is not undefined and external artwork path is empty', async () => {
            // Arrange
            const metaDataMock: IMock<FileMetadata> = Mock.ofType<FileMetadata>();
            metaDataMock.setup((x) => x.path).returns(() => '/home/MyUser/Music/track.mp3');

            externalArtworkPathGetterMock.setup((x) => x.getExternalArtworkPath('/home/MyUser/Music/track.mp3')).returns(() => '');

            // Act
            const actualArtwork: Buffer = await externalAlbumArtworkGetter.getExternalArtworkAsync(metaDataMock.object);

            // Assert
            expect(actualArtwork).toBeUndefined();
        });

        it('should return undefined if fileMetaData is not undefined and external artwork path is space', async () => {
            // Arrange
            const metaDataMock: IMock<FileMetadata> = Mock.ofType<FileMetadata>();
            metaDataMock.setup((x) => x.path).returns(() => '/home/MyUser/Music/track.mp3');

            externalArtworkPathGetterMock.setup((x) => x.getExternalArtworkPath('/home/MyUser/Music/track.mp3')).returns(() => '  ');

            // Act
            const actualArtwork: Buffer = await externalAlbumArtworkGetter.getExternalArtworkAsync(metaDataMock.object);

            // Assert
            expect(actualArtwork).toBeUndefined();
        });

        it('should return external artwork if fileMetaData is not undefined and an external artwork path was found', async () => {
            // Arrange
            const metaDataMock: IMock<FileMetadata> = Mock.ofType<FileMetadata>();
            const expectedArtwork = Buffer.from([1, 2, 3]);
            metaDataMock.setup((x) => x.path).returns(() => '/home/MyUser/Music/track.mp3');

            externalArtworkPathGetterMock
                .setup((x) => x.getExternalArtworkPath('/home/MyUser/Music/track.mp3'))
                .returns(() => '/home/MyUser/Music/front.png');

            imageProcessorMock
                .setup((x) => x.convertLocalImageToBufferAsync('/home/MyUser/Music/front.png'))
                .returns(async () => expectedArtwork);

            // Act
            const actualArtwork: Buffer = await externalAlbumArtworkGetter.getExternalArtworkAsync(metaDataMock.object);

            // Assert
            expect(actualArtwork).toBe(expectedArtwork);
        });
    });
});
