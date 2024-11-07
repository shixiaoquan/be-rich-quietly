import * as vscode from 'vscode';
import { execFile } from 'child_process';
import * as path from 'path';

let statusBarItem: vscode.StatusBarItem;
let stockCodes: string[] = []; // 默认股票代码数组
let interval: NodeJS.Timeout | null = null;

function fetchStockPrice(stockCodes: string[]): Promise<{ [key: string]: any }> {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, '..', 'src', 'fetch_stock_price.py');
        const args = stockCodes;

        execFile('python3', [scriptPath, ...args], (error, stdout, stderr) => {
            if (error) {
                console.error('Error fetching stock prices:', error);
                reject(error);
                return;
            }

            try {
                const ret = JSON.parse(stdout);
                const data = JSON.parse(ret);
                if (data?.error) {
                    reject(new Error(data?.error));
                } else {
                    resolve(data);
                }
            } catch (e) {
                console.error('Error parsing stock prices:', e);
                reject(e);
            }
        });
    });
}
let currentPriceText = '';
async function updateStockPrices() {
    if (statusBarItem) {
        try {
            const data = await fetchStockPrice(stockCodes);
            // console.log('Fetched stock prices:', data);
            const priceText = Object.keys(data).map(key => `${data[key]}`).join(' | ');
            if(currentPriceText === priceText) return;

            console.log('Price text:', priceText);
            statusBarItem.text = priceText || "No prices fetched";
            statusBarItem.show();

            currentPriceText = priceText;
        } catch (error) {
            console.error('Error fetching stock prices:', error);
            
            vscode.window.showErrorMessage('Error fetching stock prices: ' + JSON.stringify(error));
            statusBarItem.text = "Error fetching prices";
            statusBarItem.show();
        }
    }
}

export function activate(context: vscode.ExtensionContext) {
    console.log('Activating extension...');
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    
    // 启动时设置股票代码
    const config = vscode.workspace.getConfiguration('stockPrice');
    stockCodes = config.get<string[]>('stockCodes') || stockCodes;
    stockCodes = stockCodes.map(code => {
        return code.toLocaleLowerCase().replace(/hk-/g, '');
    })
    console.log(`Stock codes set to: ${stockCodes.join(', ')}`);

    // 每秒更新股票价格
    console.log('Starting interval to update stock prices every 3 seconds...');
    interval = setInterval(() => {
        // console.log('Interval triggered');
        updateStockPrices();
    }, 1000);

    context.subscriptions.push(statusBarItem);
}

export function deactivate() {
    if (interval) {
        clearInterval(interval);
    }
}
