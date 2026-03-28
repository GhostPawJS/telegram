import * as fs from 'node:fs';
import * as https from 'node:https';
import type { MockBot } from '../lib/mock_grammy.ts';

export interface DownloadResult {
	localPath: string;
	fileSize: number;
}

type Downloader = (url: string, dest: string) => Promise<number>;

export async function downloadFile(
	bot: MockBot,
	fileId: string,
	destPath: string,
	_downloader?: Downloader,
): Promise<DownloadResult> {
	const downloader = _downloader ?? downloadToFile;
	const fileInfo = (await bot.call('getFile', { file_id: fileId })) as { file_path: string };
	const url = `https://api.telegram.org/file/bot${bot.token}/${fileInfo.file_path}`;
	const fileSize = await downloader(url, destPath);
	return { localPath: destPath, fileSize };
}

function downloadToFile(url: string, dest: string): Promise<number> {
	return new Promise((resolve, reject) => {
		const file = fs.createWriteStream(dest);
		https
			.get(url, (res) => {
				let size = 0;
				res.on('data', (chunk: Buffer) => {
					size += (chunk as Buffer).length;
				});
				res.pipe(file);
				file.on('finish', () => {
					file.close();
					resolve(size);
				});
				file.on('error', reject);
				res.on('error', reject);
			})
			.on('error', reject);
	});
}
