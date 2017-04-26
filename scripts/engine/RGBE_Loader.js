/**
 * Created by Accipiter Chalybs on 4/12/2017.
 */

/* This file contains code to read and write four byte rgbe file format
 developed by Greg Ward.  It handles the conversions between rgbe and
 pixels consisting of floats.  The data is assumed to be an array of floats.
 By default there are three floats per pixel in the order red, green, blue.
 (RGBE_DATA_??? values control this.)  Only the mimimal header reading and
 writing is implemented.  Each routine does error checking and will return
 a status value as defined below.  This code is intended as a skeleton so
 feel free to modify it to suit your needs.
 (Place notice here if you modified the code.)
 posted to http://www.graphics.cornell.edu/~bjw/
 partially converted to javascript by Alex Hawker
 written by Bruce Walter  (bjw@graphics.cornell.edu)  5/26/95
 based on code written by Greg Ward
 */


let RGBE_LOADER = {};

/* offsets to red, green, and blue components in a data (float) pixel */
RGBE_LOADER.DATA_RED = 0;
RGBE_LOADER.DATA_GREEN = 1;
RGBE_LOADER.DATA_BLUE =  2;
/* number of floats per pixel */
RGBE_LOADER.DATA_SIZE  = 3;

RGBE_LOADER.VALID_PROGRAMTYPE = 0x01;
RGBE_LOADER.VALID_GAMMA       = 0x02;
RGBE_LOADER.VALID_EXPOSURE    = 0x04;

RGBE_LOADER.loadHDR = function(filename, output, callback) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", filename, true);
    xhr.responseType = "arraybuffer";

    xhr.onload = function () {
        let arrayBuffer = xhr.response; // Note: not oReq.responseText
        if (arrayBuffer) {
            let byteArray = new Uint8Array(arrayBuffer);
            let imgSize = RGBE_LOADER.ReadHeader(byteArray);
            imgSize[0] = parseInt(imgSize[0]);
            imgSize[1] = parseInt(imgSize[1]);
            output.width = imgSize[0];
            output.height = imgSize[1];
            output.data = new Float32Array(output.width * output.height * 4);
            let startIndex=0;
            let newLinesFound =0;
            for (let i=0; i<byteArray.length; ++i) {
                if (byteArray[i] === 10) { //10 === '\n' in ascii
                    newLinesFound++;
                }
                if (newLinesFound === 5) {
                    startIndex = i+1;
                    break;
                }
            }
            /*for (let x=0; x<output.data.length; ++x) {
                output.data[x] = Math.random();//byteArray[x%100];
                //output.data[x] = output.data[x] / output.data[(x+1)%100]
            }*/
            //TODO speed this up if possible / needed
            RGBE_LOADER.ReadPixels_RLE(output.data, byteArray.slice(startIndex, byteArray.length), imgSize[0], imgSize[1]);
            callback();
        }
    };

    xhr.send(null);
};

/*
enum rgbe_error_codes {
        rgbe_read_error,
        rgbe_write_error,
        rgbe_format_error,
        rgbe_memory_error,
};*/

/* default error routine.  change this to change error handling */
/*static int rgbe_error(int rgbe_error_code, char *msg)
{
    switch (rgbe_error_code) {
        case rgbe_read_error:
            perror("RGBE read error");
            break;
        case rgbe_write_error:
            perror("RGBE write error");
            break;
        case rgbe_format_error:
            fprintf(stderr,"RGBE bad file format: %s\n",msg);
            break;
        default:
        case rgbe_memory_error:
            fprintf(stderr,"RGBE error: %s\n",msg);
    }
    return RGBE_RETURN_FAILURE;
}*/

/* standard conversion from rgbe to float pixels */
/* note: Ward uses ldexp(col+0.5,exp-(128+8)).  However we wanted pixels */
/*       in the range [0,1] to map back into the range [0,1].            */
RGBE_LOADER.rgbe2float = function(rgbe)
{
    let r = 0;
    let g = 0;
    let b = 0;

    if (rgbe[3] !== 0) {   /*nonzero pixel*/
        let f = Math.pow(2.0,rgbe[3]-(128+8));
        r = rgbe[0] * f;
        g = rgbe[1] * f;
        b = rgbe[2] * f;
    }

    return [r,g,b];
};

/* minimal header reading.  modify if you want to parse more information */
RGBE_LOADER.ReadHeader = function(byteData)
{
    let width = -1;
    let height = -1;
    let info = {programtype: []};
    let found_format = 0;

    let isspace = function(inputChar) {
        let ws = [" ","\t","\n","\v","\f","\r"];
        for (let c of ws) {
            if (c===inputChar) { return true; }
        }
        return false;
    };

    let buf = String.fromCharCode.apply(null, byteData.slice(0, 128));

    if (info) {
        info.valid = 0;
        info.programtype[0] = 0;
        info.gamma = info.exposure = 1.0;
    }
    if ((byteData[0] !== "#")||(byteData[1] !== "?")) { //NOTE this compare doesn't actually work
        /* if you want to require the magic token then uncomment the next line */
        /*return rgbe_error(rgbe_format_error,"bad initial token"); */
    }
    /*
    else if (info) {
        info.valid |= RGBE_LOADER.VALID_PROGRAMTYPE;
        for(let i=0;i<sizeof(info.programtype)-1;i++) {
            if ((buf[i+2] === 0) || isspace(buf[i+2]))
                break;
            info->programtype[i] = buf[i+2];
        }
        info->programtype[i] = 0;
        if (fgets(buf,sizeof(buf)/sizeof(buf[0]),fp) == 0)
            return rgbe_error(rgbe_read_error,NULL);
    }
    for(;;) {
        if ((byteData[0] === 0)||(byteData[0] === "\n"))
            return rgbe_error(rgbe_format_error,"no FORMAT specifier found");
        else if (strcmp(buf,"FORMAT=32-bit_rle_rgbe\n") == 0)
            break;       /* format found so break out of loop
        else if (info && (sscanf(buf,"GAMMA=%g",&tempf) == 1)) {
            info.gamma = tempf;
            info.valid |= RGBE_VALID_GAMMA;
        }
    else if (info && (sscanf(buf,"EXPOSURE=%g",&tempf) == 1)) {
            info.exposure = tempf;
            info.valid |= RGBE_VALID_EXPOSURE;
        }
        if (fgets(buf,sizeof(buf)/sizeof(buf[0]),fp) == 0)
            return rgbe_error(rgbe_read_error,NULL);
    }
    if (fgets(buf,sizeof(buf)/sizeof(buf[0]),fp) == 0)
        return rgbe_error(rgbe_read_error,NULL);
    if (strcmp(buf,"\n") != 0)
        return rgbe_error(rgbe_format_error,
            "missing blank line after FORMAT specifier");
    if (fgets(buf,sizeof(buf)/sizeof(buf[0]),fp) == 0)
        return rgbe_error(rgbe_read_error,NULL);
    */
    const regex = /[\s\S]*-Y\s+(\d+)\s\+X\s+(\d+)[\s\S]*/;
    let imgSize = buf.replace(regex, "$1,$2").split(",");

    return imgSize;
};

/* simple read routine.  will not correctly handle run length encoding */
RGBE_LOADER.ReadPixels = function(output, byteData)
{
    let oi = 0;
    for (let index=0; index < byteData.length; index+=4)
    {

        let r = 0;
        let g = 0;
        let b = 0;

        if (byteData[index+3] !== 0) {   /*nonzero pixel*/
            let f = Math.pow(2.0,byteData[index+3]-(128+8));
            r = byteData[index+0] * f;
            g = byteData[index+1] * f;
            b = byteData[index+2] * f;
        }

        output[oi] = r; ++oi;
        output[oi] = g; ++oi;
        output[oi] = b; ++oi;
    }
    return output;
};

//scanline_width = imgWidth, num_scalines = imgHeight
RGBE_LOADER.ReadPixels_RLE = function( output, byteData,scanline_width, num_scanlines)
{
    /*unsigned char rgbe[4], *scanline_buffer, *ptr, *ptr_end;
    int i, count;
    unsigned char buf[2];*/

    let oi =0; // output index
    let index = 0;
    let exponents = new Float32Array(scanline_width);
    let ZERO_VAL = -1;

    if ((scanline_width < 8)||(scanline_width > 0x7fff)) {
        /* run length encoding is not allowed so read flat*/
        console.log("not rle - probably bad");
        return RGBE_LOADER.ReadPixels(output, byteData);
    }

    let height = num_scanlines;

    /* read in each successive scanline */
    while(num_scanlines > 0) {
        let offset = (height - num_scanlines) * scanline_width * 3;

        if ((byteData[index+0] !== 2)||(byteData[index+1] !== 2)||(byteData[index+2] & 0x80)) {
            /* this file is not run length encoded */
            console.log("Not run length encoded (most likely an error");
            return RGBE_LOADER.ReadPixels(output, byteData.slice(index, byteData.length));
        }
        if (( ( byteData[index+2] )<<8 | byteData[index+3]) !== scanline_width) {
            alert("wrong scanline width");
            return rgbe_error(rgbe_format_error,"wrong scanline width");
        }
        index+=4;

        let ptr = 0;
        /* read each of the four channels for the scanline into the buffer */
        for(let i=0;i<4;i++) {
            ptr = 0;
            let ptr_end = scanline_width;
            while(ptr < ptr_end) {
                if (byteData[index+0] > 128) {
                    /* a run of the same value */
                    let count = byteData[index + 0] - 128;
                    if ((count === 0) || (count > ptr_end - ptr)) {
                        console.log("bad scanline data");
                        return rgbe_error(rgbe_format_error, "bad scanline data");
                    }
                    while (count-- > 0) {
                        if (i !== 3) {
                            output[offset + 3*ptr++ + i] = byteData[index + 1];
                        } else {
                            if (byteData[index + 1] !== 0) {
                                exponents[ptr++] = Math.pow(2.0,byteData[index + 1]-(128+8));
                            } else {
                                exponents[ptr++] = ZERO_VAL;
                            }
                        }
                    }
                    index+=2;
                }
                else {
                    /* a non-run */
                    let count = byteData[index+0];
                    if ((count === 0)||(count > ptr_end - ptr)) {
                        alert("bad scanline data2");
                        return rgbe_error(rgbe_format_error,"bad scanline data");
                    }
                    if (i !== 3) {
                        output[3*ptr++ + i + offset] = byteData[index+1];
                    } else {
                        if (byteData[index + 1] !== 0) {
                            exponents[ptr++] = Math.pow(2.0,byteData[index + 1]-(128+8));
                        } else {
                            exponents[ptr++] = ZERO_VAL;
                        }
                    }
                    index+=2;
                    if (--count > 0) {
                        while (count-- > 0) {
                            if (i !== 3) {
                                output[3*ptr++ + i + offset] = byteData[index++];
                            } else {
                                if (byteData[index] !== 0) {
                                    exponents[ptr++] = Math.pow(2.0,byteData[index++]-(128+8));
                                } else {
                                    exponents[ptr++] = ZERO_VAL; index++;
                                }
                            }
                        }
                    }
                }
            }
        }

        /* now convert data from buffer into floats */
        let i=0;
        while (i<scanline_width) {
            if (exponents[i] === ZERO_VAL) {
                ++i; oi+=3; continue;
            }

            output[oi] *= exponents[i];
            output[oi+1] *= exponents[i];
            output[oi+2] *= exponents[i];

            ++i;
            oi+=3;
        }
        num_scanlines--;
    }
    return output;
};