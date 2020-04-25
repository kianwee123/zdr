
enum STEER {

    P1 = 1,
    P2 = 2,
    P3 = 3,
    P4 = 4,
    P5 = 5,
    P6 = 6

}
//% weight=5 color=#9900CC icon="\uf021"
namespace ZDR {

 //********************扩频模式寄存器地址定义***************************
 const LR_RegFifo=                                 0x00
//常用设置
const LR_RegOpMode=                                0x01
const LR_RegFrMsb=                                 0x06
const  LR_RegFrMid=                                0x07
const LR_RegFrLsb=                                 0x08
//Tx设置
const LR_RegPaConfig  =                            0x09
const LR_RegPaRamp=                                0x0A
const LR_RegOcp   =                                0x0B
//Rx设置
const LR_RegLna   =                                0x0C
//LoRa寄存器
const LR_RegFifoAddrPtr  =                         0x0D
const LR_RegFifoTxBaseAddr =                       0x0E
const LR_RegFifoRxBaseAddr  =                      0x0F
const LR_RegFifoRxCurrentaddr =                    0x10
const LR_RegIrqFlagsMask  =                        0x11
const LR_RegIrqFlags   =                           0x12
const LR_RegRxNbBytes =                            0x13
const LR_RegRxHeaderCntValueMsb =                  0x14
const LR_RegRxHeaderCntValueLsb =                  0x15
const LR_RegRxPacketCntValueMsb =                  0x16
const LR_RegRxPacketCntValueLsb =                  0x17
const LR_RegModemStat  =                           0x18
const LR_RegPktSnrValue =                          0x19
const LR_RegPktRssiValue=                          0x1A
const LR_RegRssiValue   =                          0x1B
const LR_RegHopChannel  =                          0x1C
const LR_RegModemConfig1=                          0x1D
const LR_RegModemConfig2=                          0x1E
const LR_RegSymbTimeoutLsb  =                      0x1F
const LR_RegPreambleMsb =                          0x20
const LR_RegPreambleLsb =                          0x21
const LR_RegPayloadLength =                        0x22
const LR_RegMaxPayloadLength  =                    0x23
const LR_RegHopPeriod  =                           0x24
const LR_RegFifoRxByteAddr =                       0x25
//I/O设置
const REG_LR_DIOMAPPING1 =                         0x40
const REG_LR_DIOMAPPING2 =                         0x41
//版本
const  REG_LR_VERSION    =                          0x42
//额外设置
const REG_LR_PLLHOP    =                           0x44
const REG_LR_TCXO    =                             0x4B
const REG_LR_PADAC    =                            0x4D
const REG_LR_FORMERTEMP =                          0x5B
const  REG_LR_AGCREF      =                         0x61
const  REG_LR_AGCTHRESH1 =                          0x62
const  REG_LR_AGCTHRESH2  =                         0x63
const REG_LR_AGCTHRESH3 = 0x64
    
    let sx1276_7_8FreqTbl: number[][] = [
         [0x6C, 0x80, 0x00],//434MHz
         [0x6d, 0x00, 0x12],//436MHz
         [0x6d, 0x80, 0x12],//438MHz
         [0x6e, 0x00, 0x12]];//440MHz
let sx1276_7_8PowerTbl: number[] = [
    0xFF,               //20dbm  
    0xFC,               //17dbm
    0xF9,               //14dbm
    0xF6,               //11dbm 
]; 
let sx1276_7_8SpreadFactorTbl:number[] = [6,7,8,9,10,11,12];
let sx1276_7_8LoRaBwTbl: number[] = [
//7.8KHz,10.4KHz,15.6KHz,20.8KHz,31.2KHz,41.7KHz,62.5KHz,125KHz,250KHz,500KHz
0,1,2,3,4,5,6,7,8,9
]; 
let   mode=0
let   Freq_Sel=0
let   Power_Sel=0
let   Lora_Rate_Sel=0
let   BandWide_Sel=0
let   Fsk_Rate_Sel=0
let  SysTime=0

let CR  = 0x01
let CRC = 0x01//CRC使能
    
let initialized = false
    function NSS_Reset(): void {
        pins.digitalWritePin(DigitalPin.P16, 0);
    }
    function NSS_Set(): void {
        pins.digitalWritePin(DigitalPin.P16, 1);
    }
    
 function SPIRead(addr: number): number {
        let temp;
        //pins.digitalWritePin(DigitalPin.P16, 0);
        NSS_Reset();
        pins.spiWrite(addr&0x7f);
        temp = pins.spiWrite(0xff);
        //pins.digitalWritePin(DigitalPin.P16, 1);
        NSS_Set();
        return temp;
    }

    function SPIWrite(addr: number, WrPara: number): void {
        //pins.digitalWritePin(DigitalPin.P16, 0);
        NSS_Reset();
        pins.spiWrite(addr | 0x80);
        pins.spiWrite(WrPara);
        //pins.digitalWritePin(DigitalPin.P16, 1);
        NSS_Set();
    }


  function BurstWrite(addr: number,  ptr: number[], length: number): void {
    let i;
    if(length<=1)//length must more than one
    {

    } 
    else  
    {   
        //pins.digitalWritePin(DigitalPin.P16, 0);
        NSS_Reset();
        pins.spiWrite(addr|0x80);
        for (i = 0; i < length; i++)
            pins.spiWrite(ptr[i]);
        //pins.digitalWritePin(DigitalPin.P16, 1);
        NSS_Set();
    }
  }
  
  function SPIBurstRead(addr: number, length: number): number[] 
  {    
      let i;
      if (length <= 1)//length must more than one
      {    
        let lr: number[] = [0x00];
        return lr;
      }else {
          let ptr: number[] = [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
              , 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
              0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
          //pins.digitalWritePin(DigitalPin.P16, 0);
          NSS_Reset();
          pins.spiWrite(addr & 0x7f); 
          for (i = 0; i < length; i++)
              ptr[i] = pins.spiWrite(0xff);

          //pins.digitalWritePin(DigitalPin.P16, 1);
          NSS_Set();
          
          return ptr;
      }
  }

    function sx1276_7_8_Standby(): void 
    {
      SPIWrite(LR_RegOpMode,0x09);  //待机//低频模式
    }
    
    function sx1276_7_8_Sleep(): void 
    {
      SPIWrite(LR_RegOpMode,0x08);  //睡眠//低频模式
    }

    function sx1276_7_8_EntryLoRa(): void 
    {
      SPIWrite(LR_RegOpMode,0x88);  //低频模式
    }
    function sx1276_7_8_LoRaClearIrq(): void 
    {
      SPIWrite(LR_RegIrqFlags,0xFF);
    }
    
    function delay_ms(sleepTime: number = 0): void 
    {
      let x,y;
      for(x=sleepTime;x>0;x--)
        for(y=114;y>0;y--);
    }
    
    function sx1276_7_8_ConfigTX(): void 
    {
        let i; 
        
        sx1276_7_8_Sleep();//改变当前模式必须进入睡眠模式
        for(i=250;i!=0;i--)//延时
        ;
        delay_ms(15);
    
        //扩频模式
        sx1276_7_8_EntryLoRa();  
        //SPIWrite(0x5904);//Change digital regulator form 1.6V to 1.47V: see errata note
        
        BurstWrite(LR_RegFrMsb,sx1276_7_8FreqTbl[Freq_Sel],3);//设置频率
    
        //设置基本参数 
        SPIWrite(LR_RegPaConfig,sx1276_7_8PowerTbl[Power_Sel]);//设置输出增益  
        
        SPIWrite(LR_RegOcp,0x0B);                              //RegOcp,关闭过流保护
        SPIWrite(LR_RegLna,0x23);                              //RegLNA,使能低噪声放大器
        
        if(sx1276_7_8SpreadFactorTbl[Lora_Rate_Sel]==6)        //扩频因子=6
        {
            let tmp;
            SPIWrite(LR_RegModemConfig1,((sx1276_7_8LoRaBwTbl[BandWide_Sel]<<4)+(CR<<1)+0x01));//隐式报头使能 CRC使能(0x02) & 纠错编码率 4/5(0x01), 4/6(0x02), 4/7(0x03), 4/8(0x04)
            SPIWrite(LR_RegModemConfig2,((sx1276_7_8SpreadFactorTbl[Lora_Rate_Sel]<<4)+(CRC<<2)+0x03));
          
            tmp = SPIRead(0x31);
            tmp &= 0xF8;        //1111 1000
            tmp |= 0x05;        //0000 1001
            SPIWrite(0x31,tmp);
            SPIWrite(0x37,0x0C);//0000 1100
        } 
        else
        {
            SPIWrite(LR_RegModemConfig1,((sx1276_7_8LoRaBwTbl[BandWide_Sel]<<4)+(CR<<1)+0x00));//显示报头 CRC使能(0x02) & 纠错编码率 4/5(0x01), 4/6(0x02), 4/7(0x03), 4/8(0x04)
            SPIWrite(LR_RegModemConfig2,((sx1276_7_8SpreadFactorTbl[Lora_Rate_Sel]<<4)+(CRC<<2)+0x03));  //扩频因子 &  LNA gain set by the internal AGC loop 
        }
        SPIWrite(LR_RegSymbTimeoutLsb,0xFF);//RegSymbTimeoutLsb Timeout = 0x3FF(Max) 
        
        SPIWrite(LR_RegPreambleMsb,0x00);   //RegPreambleMsb 
        SPIWrite(LR_RegPreambleLsb,12);     //RegPreambleLsb 前导码8+4=12字节 
        
        SPIWrite(REG_LR_DIOMAPPING2,0x01);  //RegDioMapping2 DIO5=00, DIO4=01
                                            //DIO5 clkout DIO4 PLLlock DIO3 Vaildheader
                                            //DIO2 Fhsschang DIO1 Fhsschangechannel
                                            //DIO0 TxDone
        sx1276_7_8_Standby();               //进入待机模式
    }

    function Get_Key_Chn(): number {
        let k1 = pins.digitalReadPin(DigitalPin.P1);
        let k2 = pins.digitalReadPin(DigitalPin.P2);
        if(k1==0 && k2==0)  {return 0;}  
        else if(k1 == 1 && k2 == 0) { return 1; } 
        else if (k1 == 0 && k2 == 1) { return 2; } 
        else if (k1 == 1 && k2 == 1) { return 3; } 
        return 0;
    }
    function Get_NIRQ(): number
    { 
       return pins.digitalReadPin(DigitalPin.P8);
    }

    function sx1276_7_8_ConfigRX(): void
    {
        
        let i;
        sx1276_7_8_Sleep();//改变当前模式必须进入睡眠模式
        for (i = 250; i != 0; i--)//延时
            ;
        delay_ms(15);

        //扩频模式
        sx1276_7_8_EntryLoRa();

        BurstWrite(LR_RegFrMsb, sx1276_7_8FreqTbl[Freq_Sel], 3);//设置频率

        //设置基本参数 
        SPIWrite(LR_RegPaConfig, sx1276_7_8PowerTbl[Power_Sel]);//设置输出增益  

        SPIWrite(LR_RegOcp, 0x0B);                              //RegOcp,关闭过流保护
        SPIWrite(LR_RegLna, 0x23);                              //RegLNA,使能低噪声放大器

        if (sx1276_7_8SpreadFactorTbl[Lora_Rate_Sel] == 6)        //扩频因子=6
        {
            let tmp;
            SPIWrite(LR_RegModemConfig1, ((sx1276_7_8LoRaBwTbl[BandWide_Sel] << 4) + (CR << 1) + 0x01));//隐式报头使能 SXCRC使能(0x02) & 纠错编码率 4/5(0x01), 4/6(0x02), 4/7(0x03), 4/8(0x04)
            SPIWrite(LR_RegModemConfig2, ((sx1276_7_8SpreadFactorTbl[Lora_Rate_Sel] << 4) + (CRC << 2) + 0x03));

            tmp = SPIRead(0x31);
            tmp &= 0xF8;        //1111 1000
            tmp |= 0x05;        //0000 1001
            SPIWrite(0x31, tmp);
            SPIWrite(0x37, 0x0C);//0000 1100
        }
        else {
            SPIWrite(LR_RegModemConfig1, ((sx1276_7_8LoRaBwTbl[BandWide_Sel] << 4) + (CR << 1) + 0x00));//显示报头 SXCRC使能(0x02) & 纠错编码率 4/5(0x01), 4/6(0x02), 4/7(0x03), 4/8(0x04)
            SPIWrite(LR_RegModemConfig2, ((sx1276_7_8SpreadFactorTbl[Lora_Rate_Sel] << 4) + (CRC << 2) + 0x03));  //扩频因子 &  LNA gain set by the internal AGC loop 
        }
        SPIWrite(LR_RegSymbTimeoutLsb, 0xFF);//RegSymbTimeoutLsb Timeout = 0x3FF(Max) 

        SPIWrite(LR_RegPreambleMsb, 0x00);   //RegPreambleMsb 
        SPIWrite(LR_RegPreambleLsb, 12);     //RegPreambleLsb 前导码8+4=12字节 

        SPIWrite(REG_LR_DIOMAPPING2, 0x00);  //RegDioMapping2 DIO5=00, DIO4=01
        //DIO5 clkout DIO4 PLLlock DIO3 Vaildheader
        //DIO2 Fhsschang DIO1 Fhsschangechannel
        //DIO0 RxDone
        sx1276_7_8_Standby();               //进入待机模式   
    }
    
    function sx1276_7_8_LoRaEntryRx(): number
    {
        let addr;
        let temp;
        sx1276_7_8_ConfigRX();               //基本参数配置
        SPIWrite(REG_LR_PADAC, 0x84);         //正常的Rx
        SPIWrite(LR_RegHopPeriod, 0x00);      //RegHopPeriod 无跳频 0xFF
        SPIWrite(REG_LR_DIOMAPPING1, 0x01);   //DIO0=00, DIO1=00, DIO2=00, DIO3=01   
        SPIWrite(LR_RegIrqFlagsMask, 0x3F);   //打开RxDone中断&超时0011 1111 
        SPIWrite(LR_RegPayloadLength, 0xff );    //RegPayloadLength  21字节(在扩频因子为6时数据大于一字节此寄存器必须配置) 
        addr = SPIRead(LR_RegFifoRxBaseAddr);//Read RxBaseAddr
        SPIWrite(LR_RegFifoAddrPtr, addr);    //RxBaseAddr -> FiFoAddrPtr　 
        SPIWrite(LR_RegOpMode, 0x8d);         //连续Rx模式//低频模式10001101
        SysTime = 0;
        while (1) {
            temp = SPIRead(LR_RegModemStat);
            if ((temp & 0x04) == 0x04)//Rx-on going RegModemStat//RX进行中
                return 1;
            SysTime++;
            if (SysTime >= 3)
                return 0;                  //超时错误
        }
        return 0;
    }  
 
function sx1278_EntrySend(length :number): number 
   {
       let addr,temp;   
       sx1276_7_8_ConfigTX();               //配置基本参数    
       SPIWrite(REG_LR_PADAC,0x87);         //Tx for 20dBm
       SPIWrite(LR_RegHopPeriod,0x00);      //RegHopPeriod 无跳频
       SPIWrite(REG_LR_DIOMAPPING1,0x41);   //DIO0=01, DIO1=00, DIO2=00, DIO3=0   
       sx1276_7_8_LoRaClearIrq();
       SPIWrite(LR_RegIrqFlagsMask, 0xF7);   //打开TxDone中断  
       SPIWrite(LR_RegPayloadLength,length);    //RegPayloadLength  
       addr = SPIRead(LR_RegFifoTxBaseAddr);//FiFo数据缓冲区中发送调制器的写入基地址
       SPIWrite(LR_RegFifoAddrPtr,addr);    //Fifo数据缓冲区中SPI接口地址指针
       SysTime = 0;
       while(1)
       {
           temp=SPIRead(LR_RegPayloadLength);
           if(temp==length)
           {
               return 1;   
           }
           SysTime++;
           if(SysTime>=3)    
               return 0;
       }
       return -1;
    }
    function sx1278_SendPacket(ptr: number[], length: number): number {  
        BurstWrite(0x00, ptr, length);
        SPIWrite(LR_RegOpMode,0x8b);       //Tx Mode           
        while(1)
        {
            if(Get_NIRQ())                 //Packet send over
            {   
                SPIRead(LR_RegIrqFlags);
                sx1276_7_8_LoRaClearIrq(); //清除 irq
                sx1276_7_8_Standby();      //进入待机模式
                return 1;      
            }
         } 
          return 0;
    }   
    function sx1278_Send(ptr: number[], length: number): number {
        let ret = sx1278_EntrySend(length);
        if (ret <= 0) return ret;
        ret = sx1278_SendPacket(ptr, length);
        return ret;
    }
    function sx1276_7_8_Config(): void 
    {
        let i; 
        
        sx1276_7_8_Sleep();//改变当前模式必须进入睡眠模式
        for(i=250;i!=0;i--)//延时
            ;
        
        delay_ms(15);
    
        //扩频模式
        sx1276_7_8_EntryLoRa();  
        //SPIWrite(0x5904);//Change digital regulator form 1.6V to 1.47V: see errata note
        
        BurstWrite(LR_RegFrMsb, sx1276_7_8FreqTbl[Freq_Sel],3);//设置频率
    
        //设置基本参数 
        SPIWrite(LR_RegPaConfig,sx1276_7_8PowerTbl[Power_Sel]);//设置输出增益  
        
        SPIWrite(LR_RegOcp,0x0B);                              //RegOcp,关闭过流保护
        SPIWrite(LR_RegLna,0x23);                              //RegLNA,使能低噪声放大器
        
        if(sx1276_7_8SpreadFactorTbl[Lora_Rate_Sel]==6)        //扩频因子=6
        {
            let tmp;
            SPIWrite(LR_RegModemConfig1,((sx1276_7_8LoRaBwTbl[BandWide_Sel]<<4)+(CR<<1)+0x01));//隐式报头使能 CRC使能(0x02) & 纠错编码率 4/5(0x01), 4/6(0x02), 4/7(0x03), 4/8(0x04)
            SPIWrite(LR_RegModemConfig2,((sx1276_7_8SpreadFactorTbl[Lora_Rate_Sel]<<4)+(CRC<<2)+0x03));
          
            tmp = SPIRead(0x31);
            tmp &= 0xF8;        //1111 1000
            tmp |= 0x05;        //0000 1001
            SPIWrite(0x31,tmp);
            SPIWrite(0x37,0x0C);//0000 1100
        } 
        else
        {
            SPIWrite(LR_RegModemConfig1,((sx1276_7_8LoRaBwTbl[BandWide_Sel]<<4)+(CR<<1)+0x00));//显示报头 CRC使能(0x02) & 纠错编码率 4/5(0x01), 4/6(0x02), 4/7(0x03), 4/8(0x04)
            SPIWrite(LR_RegModemConfig2,((sx1276_7_8SpreadFactorTbl[Lora_Rate_Sel]<<4)+(CRC<<2)+0x03));  //扩频因子 &  LNA gain set by the internal AGC loop 
        }
        SPIWrite(LR_RegSymbTimeoutLsb,0xFF);//RegSymbTimeoutLsb Timeout = 0x3FF(Max) 
        
        SPIWrite(LR_RegPreambleMsb,0x00);   //RegPreambleMsb 
        SPIWrite(LR_RegPreambleLsb,12);     //RegPreambleLsb 前导码8+4=12字节 
        
        SPIWrite(REG_LR_DIOMAPPING2,0x01);  //RegDioMapping2 DIO5=00, DIO4=01
                                            //DIO5 clkout DIO4 PLLlock DIO3 Vaildheader
                                            //DIO2 Fhsschang DIO1 Fhsschangechannel
                                            //DIO0 TxDone
        sx1276_7_8_Standby();               //进入待机模式
    }

    function initSX1278(): void {
        pins.spiFrequency(10000);
        pins.spiFormat(8, 3);
        pins.spiPins(DigitalPin.P15, DigitalPin.P14, DigitalPin.P13);
        initialized = true;

        SysTime       = 0;
        mode          = 0x01;//lora mode
        Freq_Sel      = 0x00;//433M
        Power_Sel     = 0x00;//20dB
        Lora_Rate_Sel = 0x05;//扩频因子为12
        BandWide_Sel  = 0x07;//125KHZ
        Fsk_Rate_Sel  = 0x00;//FSK模式下的扩频因子
        Freq_Sel = Get_Key_Chn();
        sx1276_7_8_Config();//设置频率，增益，扩频因子，纠错编码率4/5，前导码12字节
        //扩频模式初始化      //关闭过流保护，打开低噪声放大器，打开CRC，显式报头，超时，增益自动校正
                            //preambleDetect到DIO映射 DIO0 TxDone
        
    }
    /*
      param参数说明:
      id:舵机id编号，从1 至 6
      angle：角度，范围：0-180
      timeout:减速值：0-255,值越大，速度越慢
    */
    function create_motor_package(id: number, angle: number, time: number, speed: number): number[] {
        let temp_Data: number[] = [0x55, 0xdd, 0x80,0x0a, 0x91, 0x01, 0, 0,0,0, 0, 0, 0,0];
        temp_Data[6] = (time >> 8) & 0xff;
        temp_Data[7] = time & 0xFF;
        temp_Data[8] = (speed >> 8) & 0xff;
        temp_Data[9] = speed & 0xFF;
        temp_Data[10]  = id;
        temp_Data[11]  = (angle >> 8) & 0xff ;
        temp_Data[12] = angle & 0xff;
        temp_Data[13] = get_crc(temp_Data, 13);
        return temp_Data;
    }    
    function  get_crc(buffer:number[],len:number):number {
        let i,crc=0;
        for(i=0;i<len;i++)
        {
            crc+=buffer[i];
        }
        return crc;
    }

    let unload_Data: number[] = [0x55, 0xdd, 0x80,0x09, 0x95, 0x06, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06,0x6b];
    //let arm_Data: number[] = [0x55, 0xdd, 0x08, 0x03, 0x01, 240, 0x00, 0x02,90, 0x00];
    let init_arm_Data: number[] = [0x55, 0xdd, 0x80, 25, 0x91, 0x06, 0, 0, 0, 100,0x01,0, 90, 0x02,0, 90, 0x03,0, 90, 0x04,0, 90, 0x05,0, 90, 0x06,0, 90,0xf7];
   
    /**
     *init arm
     *
    */
    //% blockId=initArm block="初始化机械臂"
    //% weight=85
     export function initArm(): void {
        if (!initialized) {
            initSX1278();
        }
        sx1278_Send(init_arm_Data, init_arm_Data.length);      
    
     }
    /**
     *unloads arm
     *
    */
    //% blockId=unloadsArms block="所有舵机卸力"
    //% weight=85
    export function unloadsArms(): void {   	
    	  if (!initialized) {
            initSX1278();
        }
        sx1278_Send(unload_Data, unload_Data.length); 
    }
     /**
     *
     * @param steer [1-6] choose steer; eg: 1
     *
    */
    //% blockId=unloadsArm block="舵机卸力 舵机|%steer|"
    //% weight=85
    export function unloadsArm(steer:STEER): void {
        if (!initialized) {
            initSX1278();
        }
        let temp_Data: number[] = [0x55, 0xdd, 0x80,0x04, 0x95, 0x01,0x01];
        temp_Data[6] = steer;
        temp_Data[7] = get_crc(temp_Data,7);
        sx1278_Send(temp_Data, temp_Data.length);       
    }
    
    /**
     *
     * @param steer [1-6] choose steer; eg: 1
     * @param angle [0-180]  choose ANGLE; eg: 90,0,180
    */
    //% blockId=steerAngle block="舵机|%steer| 角度|%angle| 中速"
    //% weight=85
    //% angle.min=0 angle.max=180
    export function steerAngle(steer:STEER,angle:number): void {
        if (!initialized) {
            initSX1278();
        }
        let _data = create_motor_package(steer,angle,0,200);
        sx1278_Send(_data, _data.length);      
       
    }

    /**
     *
     * @param steer [1-6] choose steer; eg: 1
     * @param angle [0-180]  choose ANGLE; eg: 90,0,180
     * @param speed [0-255] choose speed; eg: 128
    */
    //% blockId=steerAngleSpeed block="舵机|%steer| 角度|%angle| 速度|%speed|"
    //% weight=85
    //% angle.min=0 angle.max=180
    //% speed.min=0 speed.max=255
    export function steerAngleSpeed(steer:STEER,angle:number,speed:number): void {
        if (!initialized) 
        {
            initSX1278();
        }
        let _data = create_motor_package(steer,angle,0,speed);
        sx1278_Send(_data, _data.length);            
    }
    /**
       *
       * 
       * @param angle1 [0-180]  choose ANGLE; eg: 90
       * @param angle2 [0-180]  choose ANGLE; eg: 90
       * @param angle3 [0-180]  choose ANGLE; eg: 90
       * @param angle4 [0-180]  choose ANGLE; eg: 90
       * @param angle5 [0-180]  choose ANGLE; eg: 90
       * @param angle6 [0-180]  choose ANGLE; eg: 90
       * @param speed  [0-255]  choose speed; eg: 128
      */
    //% blockId=setAllServoAngles block="速度 %speed 舵机 P1 %angle1 P2 %angle2  P3 %angle3  P4 %angle4  P5 %angle5  P6 %angle6 "
    //% weight=85
    //% angle1.min=0 angle1.max=180
    //% angle2.min=0 angle2.max=180
    //% angle3.min=0 angle3.max=180
    //% angle4.min=0 angle4.max=180
    //% angle5.min=0 angle5.max=180
    //% angle6.min=0 angle6.max=180
    //% speed.min=0 speed.max=255
    //% inlineInputMode=inline
    export function setAllServoAngles(speed: number,angle1: number, angle2: number, angle3: number, angle4: number, angle5: number, angle6: number): void {
        if (!initialized) {
            initSX1278();
        }
        let temp_Data: number[]=[0,0,0,0,0,0,0,0,0,0
                                ,0,0,0,0,0,0,0,0,0,0
                                ,0,0,0,0,0,0,0,0,0];
        temp_Data[0] = 0x55;
        temp_Data[1] = 0xdd;
        temp_Data[2] = 0x80;
        temp_Data[3] = 25;
        temp_Data[4] = 0x91;
        temp_Data[5] = 0x06;
        temp_Data[6] = 0;
        temp_Data[7] = 0;
        temp_Data[8] = (speed >> 8) & 0xff;
        temp_Data[9] = speed & 0xFF;
        temp_Data[10] = 1;
        temp_Data[11] = (angle1 >> 8) & 0xff;
        temp_Data[12] = angle1 & 0xff;
        temp_Data[13] = 2;
        temp_Data[14] = (angle2 >> 8) & 0xff;
        temp_Data[15] = angle2 & 0xff;
        temp_Data[16] = 3;
        temp_Data[17] = (angle3 >> 8) & 0xff;
        temp_Data[18] = angle3 & 0xff;
        temp_Data[19] = 4;
        temp_Data[20] = (angle4 >> 8) & 0xff;
        temp_Data[21] = angle4 & 0xff;
        temp_Data[22] = 5;
        temp_Data[23] = (angle5 >> 8) & 0xff;
        temp_Data[24] = angle5 & 0xff;
        temp_Data[25] = 6;
        temp_Data[26] = (angle6 >> 8) & 0xff;
        temp_Data[27] = 0x5a;//angle6 & 0xff;
        
        temp_Data[28] = get_crc(temp_Data, 28);

        sx1278_Send(temp_Data, temp_Data.length);
    }
    /**
     *返回角度值，超时返回-3
     * @param steer [1-6] choose steer; eg: 1
     *
    */
    //% blockId=readAngle block="读舵机角度|%steer|"
    //% weight=85
    export function readAngle(steer:STEER): number {
        if (!initialized) {
            initSX1278();
        }
        let temp_Data: number[] = [0x55, 0xdd,0x00, 0x04, 0x96, 0x01,0x01,0];
        temp_Data[6] = steer;
        temp_Data[7] = get_crc(temp_Data, 7);
        sx1278_Send(temp_Data, temp_Data.length); 
        
        sx1276_7_8_LoRaEntryRx();
        let cnt=0;
        while (1) {
            if (Get_NIRQ()) 
            {
               let packet_size;
               let addr = SPIRead(LR_RegFifoRxCurrentaddr);       //接收到最后一个数据包的起始地址（数据缓冲区中）
               SPIWrite(LR_RegFifoAddrPtr, addr);              //RxBaseAddr -> FiFoAddrPtr    
               if (sx1276_7_8SpreadFactorTbl[Lora_Rate_Sel] == 6)//当扩频因子为6时，将使用隐式报头模式(不包括内部数据包的长度)
                  packet_size = 21;
               else
                  packet_size = SPIRead(LR_RegRxNbBytes);      //接收的字节数    
               let RxData = SPIBurstRead(0x00, packet_size);
               sx1276_7_8_LoRaClearIrq();
               if (RxData[0] == 0x55 && RxData[1] == 0x55) {
                  
                  if (RxData[3] == 0x15) {
                      return RxData[6];
                  }
                }              
            }
            delay_ms(1000);
            cnt++;
            if(cnt>100)
            {
                return -3;
            }
        }
        return -1;
    }
}


