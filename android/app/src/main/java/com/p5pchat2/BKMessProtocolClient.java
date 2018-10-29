
package com.p5pchat2;
import java.net.*;
import java.io.*;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import android.app.Activity;
import android.content.ContentResolver;
import android.net.Uri;

// import com.facebook.react.bridge.NativeModule;
// import com.facebook.react.bridge.ReactApplicationContext;
// import com.facebook.react.bridge.ReactContext;
// import com.facebook.react.bridge.ReactContextBaseJavaModule;
// import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.*;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.Map;
import java.util.HashMap;

public class BKMessProtocolClient extends ReactContextBaseJavaModule {
	private Socket           socket   = null;
	private DataInputStream  streamIn = null;
	private DataOutputStream  streamOut = null;
	public  int isCloseThread = 0;
	
	private FileInputStream fis = null;
	private BufferedInputStream bis = null;
	private OutputStream os = null;

	private static ReactApplicationContext reactContext = null;

	public BKMessProtocolClient(ReactApplicationContext context) {
    	super(context);
		reactContext = context;
  	}

	@Override
	public String getName() {
		return "BKMessProtocolClient";
	}

	@ReactMethod
	public void connectToServer(String address, int port, Callback errorConnectted, Callback successConnectted) {
		try {
			socket = new Socket(address,port);
			open();  
			successConnectted.invoke("successful");
		} catch (UnknownHostException e) {
			errorConnectted.invoke(e.toString());
		} catch (IOException e) {
			errorConnectted.invoke(e.toString());
		}
	}
	
	public void open()
	{  try
      {  streamIn  = new DataInputStream(socket.getInputStream());
      	 streamOut  = new DataOutputStream(socket.getOutputStream());
      }
      catch(IOException ioe)
      {  System.out.println("Error getting stream: " + ioe);
      }
	 }
	
	@ReactMethod
	public void sendRequest(String _mess)
	{  
		 try {
			streamOut.writeUTF(_mess);
		} catch (IOException e) {
			if (_mess.getBytes().length > 64000) 
			{
				WritableMap params1 = Arguments.createMap();
				params1.putString("res", "File is too big!!!");
				sendEvent("LISTENER_ERROR",params1);
			}
		}
	}
	
	public String _receiveMessages()
	{  
		String messRec = null;
		try {
			messRec = streamIn.readUTF();
			return messRec;
		} catch (IOException e) {
		}
		return messRec;
	}

	public void sendFileToServer(String url) {
		 File myFile = new File (url.toString());
		 WritableMap params = Arguments.createMap();
         byte [] mybytearray  = new byte [80000000];
         try {
			fis = new FileInputStream(myFile);
		} catch (FileNotFoundException e) {
			WritableMap params1 = Arguments.createMap();
	   		params1.putString("res", e.toString());
			sendEvent("LISTENER_ERROR",params1);
		}
         bis = new BufferedInputStream(fis);
         try {
			bis.read(mybytearray,0,mybytearray.length);
			os = this.socket.getOutputStream();
			System.out.println("Send successful!");
			os.write(mybytearray,0,mybytearray.length);
			os.flush();
		} catch (IOException e) {
		}
	 }


	@ReactMethod
	public void receiveMessages()
	{  
		String res = _receiveMessages();
		WritableMap params = Arguments.createMap();
	   	params.putString("res", res);
		JSONParser parser = new JSONParser();
		try {
			JSONObject obj = (JSONObject)parser.parse(res);
			String type = (String) obj.get("type");
			switch (type)
			{
				case "RES_CHECK_LOGIN":
					sendEvent("LISTENER_RES_CHECK_LOGIN",params);
					break;
				case "RESPONSE_INBOX":
					sendEvent("LISTENER_RES_INBOX",params);
					break;
				case "RESPONSE_OF_GET_MESSAGE":
					sendEvent("LISTENER_RES_MESSAGE",params);
					break;
				case "RES_GET_CONTENT":
					sendEvent("LISTENER_RES_GET_CONTENT_FILE",params);
					break;
				case "NOTIFICATION":
					sendEvent("LISTENER_NEW_MESSAGES",params);
					break;
				case "RES_CONFIRM_VC":
					sendEvent("LISTENER_RES_CONFIRM_VC",params);
					break;
				case "GET_CONFIRM_VIDEO_CALL":
					sendEvent("LISTENER_GET_CONFIRM_VIDEO_CALL",params);
					break;
				case "RES_REGISTRATION":
					sendEvent("LISTENER_RES_REGISTRATION",params);
					break;
				case "RES_CREATE_GROUP":
					sendEvent("LISTENER_RES_CREATE_GROUP",params);
					break;
				case "RES_GET_OUTSIDE_FRIEND":
					sendEvent("LISTENER_RES_GET_OUTSIDE_FRIEND",params);
					break;
				case "RES_LIST_FRIEND":
					sendEvent("LISTENER_RES_LIST_FRIEND",params);
					break;
				case "RES_GET_MEMBERS_OF_GROUP":
					sendEvent("LISTENER_RES_GET_MEMBERS_OF_GROUP",params);
					break;
				case "NOTIFICATION_DELETE":
					sendEvent("LISTENER_NOTIFICATION_DELETE",params);
					break;
			}
		}
		catch (ParseException e)
		{
		}
		
	}

	@ReactMethod
	public void listenMess()
	{  
		this.isCloseThread = 0;
		ReceiveMessageThread listen = new ReceiveMessageThread(this);
		listen.start();		
	}

	@ReactMethod
	public void closeListenMess()
	{  
		this.isCloseThread = 1;	
	}
    
   @ReactMethod
   public void close()
   {  try
      {  if (streamIn != null) streamIn.close();
      	 if (streamOut != null) streamOut.close();
      }
      catch(IOException ioe)
      {  System.out.println("Error closing stream: " + ioe);
      }
   }

	public void sendEvent(String eventName, WritableMap params) {
  	   reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, params);
	}
}


class ReceiveMessageThread extends Thread {
	private DataInputStream  streamIn = null;
	private BKMessProtocolClient cli = null;
	
	public ReceiveMessageThread(BKMessProtocolClient _cli) {
	   cli = _cli;
	}
	
	 
 	
	public void run() {
	    while(cli.isCloseThread == 0) {
			cli.receiveMessages();
	    }
	}
}