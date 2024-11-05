import * as vscode from 'vscode';
import puppeteer, { Browser, Page } from 'puppeteer';

let statusBarItem: vscode.StatusBarItem;
let stockCodes: string[] = []; // 默认股票代码数组
let interval: NodeJS.Timeout | null = null;
const stockMap: { [key: string]: number } = {};

let browser: Browser| null = null;
// let page: Page | null = null;
(async () => {
    browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    // page = await browser?.newPage();
})();

let isFetching = false;

const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; AS; rv:11.0) like Gecko',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.2 Safari/605.1.15',
    'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 9; SM-G960F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Mobile Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; AS; rv:11.0) like Gecko',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1.1 Safari/605.1.15',
    'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:88.0) Gecko/20100101 Firefox/88.0',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (iPad; CPU OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Linux; Android 9; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 8; SM-G960F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Mobile Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.2 Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; AS; rv:11.0) like Gecko',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Safari/605.1.15',
    'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:87.0) Gecko/20100101 Firefox/87.0',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 12_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (iPad; CPU OS 12_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1'
    
];

function getRandomUserAgent() {
    return userAgents[Math.floor(Math.random() * userAgents.length)];
}

async function fetchStockPrice(code: string): Promise<number | null> {

    console.log(`Fetching stock price for ${code}...`);
    if(!browser)  return null;

    const page = await browser?.newPage();

    if(!page) return null;

    try {
        console.log('Setting user agent...');
        await page.setUserAgent(getRandomUserAgent());

        console.log('Navigating to target page...');

        let url;
        if (code.toLowerCase().startsWith('hk-')) {
            code = code.substring(3);
            url = `https://quote.eastmoney.com/HK/${code}.html`;
        } else if (code.toLowerCase().startsWith('us-')) {
            code = code.substring(3);
            url = `https://quote.eastmoney.com/us/${code}.html`;
        } else if(code.startsWith('60')) {
            url = `https://quote.eastmoney.com/sh${code}.html`;
        } else if(code.startsWith('00') || code.startsWith('002') || code.startsWith('30')) {
            url = `https://quote.eastmoney.com/sz${code}.html`;
        } else if(code.startsWith('68')) {
            url = `https://quote.eastmoney.com/kcb/${code}.html`;
        } else {
            return null;
        }

        console.log(`Navigating to ${url}...`);
        await page.goto(url, {
            waitUntil: 'networkidle2', // 等待网络空闲表示页面加载完成
            timeout: 5000, // 超时时间
        });

        console.log('Fetching latest price...');
        const latestPrice = await page.evaluate(() => {
            const priceElement = document.querySelector('.zxj');
            return priceElement ? priceElement.textContent?.trim() : null;
        });

        if (latestPrice) {
            console.log(`${code} 最新价格: ${latestPrice}`);
            return parseFloat(latestPrice);
        } else {
            console.log('未找到最新价格数据，请检查网页结构或选择器。');
            return null;
        }
    } catch (error) {
        console.error('Error fetching stock price:', error);
        return null;
    } finally {
        console.log('Stock price fetch completed.');

        if (page) {
            page.close().catch(error => console.error('Error closing page:', error));
        }
    }
}

function updateStockPrices() {
    if (statusBarItem) {
        (async () => {
            isFetching = true;
            for (const stockCode of stockCodes) {
                try {
                    const price = await fetchStockPrice(stockCode);
                    if (price !== null) {
                        stockMap[stockCode] = price;
                        statusBarItem.text = Object.keys(stockMap).map(key => `${stockMap[key]}`).join(' | ');
                        statusBarItem.show();
                    }
                } catch (error) {
                    console.error('Error fetching stock price:', error);
                }

                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            isFetching = false;
        })();
    }
}

export function activate(context: vscode.ExtensionContext) {
    console.log('Activating extension...');
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    
    // 启动时设置股票代码
    const config = vscode.workspace.getConfiguration('stockPrice');
    stockCodes = config.get<string[]>('stockCodes') || stockCodes;
    console.log(`Stock codes set to: ${stockCodes.join(', ')}`);

    // 每秒更新股票价格
    console.log('Starting interval to update stock prices every 3 seconds...');
    interval = setInterval(() => {
        console.log('isFetching:', isFetching ? '等下一个周期' : '可以继续');
        if(isFetching) return;

        console.log('Interval triggered');
        updateStockPrices();
    }, 3000);

    context.subscriptions.push(statusBarItem);
}

export function deactivate() {
    if (interval) {
        clearInterval(interval);
    }
    if (browser) {
        browser.close().catch(error => console.error('Error closing browser:', error));
    }
}
