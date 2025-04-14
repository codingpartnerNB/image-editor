import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fabric } from 'fabric';
import { FaDownload, FaArrowLeft, FaTextHeight, FaSquare, FaCircle, FaLayerGroup } from 'react-icons/fa';
import { MdDelete, MdColorLens, MdChangeHistory, MdOutlineLayers } from 'react-icons/md';
import styles from './EditPage.module.css';
import { BiImageAlt } from 'react-icons/bi';

function EditPage({ selectedImage }) {
  const canvasRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [activeTool, setActiveTool] = useState(null);
  const [color, setColor] = useState('#4facfe');
  const [textColor, setTextColor] = useState('#ffffff');
  const [borderWidth, setBorderWidth] = useState(5);
  const [showDelete, setShowDelete] = useState(false);
    // Add this new state for the download dropdown
    const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const navigate = useNavigate();
  

  useEffect(() => {
    if (!canvasContainerRef.current) return;

    const container = canvasContainerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
    //   width: Math.min(800, window.innerWidth - 40),
      width: containerWidth,
    //   height: Math.min(600, window.innerHeight - 200),
      height: containerHeight,
      backgroundColor: 'transparent',
      selection: true,
      preserveObjectStacking: true,
    });

    if (selectedImage) {
      fabric.Image.fromURL(selectedImage, (img) => {
        const scale = Math.min(
        //   fabricCanvas.width / img.width,
        //   fabricCanvas.height / img.height
        containerWidth / img.width,
        containerHeight / img.height
        );
        img.scale(scale);
        img.set({
          selectable: false,
          evented: false,
          name: 'backgroundImage',
          originX: 'left',
          originY: 'top'
        });
        // Center the image in the container
        const left = (containerWidth - (img.width * scale)) / 2;
        const top = (containerHeight - (img.height * scale)) / 2;
        img.set({
          left: left,
          top: top
        });
        fabricCanvas.add(img);
        // fabricCanvas.centerObject(img);
        fabricCanvas.renderAll();
      });
    }

    // Event listeners for object selection
    fabricCanvas.on('selection:created', () => {
      const activeObject = fabricCanvas.getActiveObject();
      setShowDelete(!!activeObject && (activeObject.type === 'i-text' || activeObject.isShape));
    });

    fabricCanvas.on('selection:updated', () => {
      const activeObject = fabricCanvas.getActiveObject();
      setShowDelete(!!activeObject && (activeObject.type === 'i-text' || activeObject.isShape));
    });

    fabricCanvas.on('selection:cleared', () => {
      setShowDelete(false);
    });

    // Enable dragging and resizing
    fabricCanvas.on('object:moving', (options) => {
      options.target.setCoords();
    });

    fabricCanvas.on('object:scaling', (options) => {
      options.target.setCoords();
    });

    setCanvas(fabricCanvas);

    return () => {
      fabricCanvas.dispose();
    };
  }, [selectedImage]);

  const addText = () => {
    if (canvas) {
      const text = new fabric.IText('Double click to edit', {
        left: 50,
        top: 50,
        fontSize: 24,
        fill: textColor,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        shadow: 'rgba(0,0,0,0.5) 2px 2px 8px',
        stroke: '#000000',
        strokeWidth: 1,
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.3)',
        name: 'text',
        selectable: true,
        hasControls: true,
        lockMovementX: false,
        lockMovementY: false,
        lockRotation: false,
        lockScalingX: false,
        lockScalingY: false,
      });
      canvas.add(text);
      canvas.bringToFront(text);
      canvas.setActiveObject(text);
      canvas.renderAll();
      setActiveTool('text');
      setShowDelete(true);
    }
  };

  const addShape = (type) => {
    if (canvas) {
      let shape;
      const shapeProps = {
        left: 100,
        top: 100,
        fill: color,
        opacity: 0.8,
        stroke: '#ffffff',
        strokeWidth: 2,
        shadow: new fabric.Shadow('rgba(0,0,0,0.3) 3px 3px 5px'),
        name: 'shape',
        isShape: true,
        selectable: true,
        hasControls: true,
        lockMovementX: false,
        lockMovementY: false,
        lockRotation: false,
        lockScalingX: false,
        lockScalingY: false,
      };

      switch (type) {
        case 'rectangle':
          shape = new fabric.Rect({
            ...shapeProps,
            width: 100,
            height: 100,
            rx: 10,
            ry: 10,
          });
          break;
        case 'circle':
          shape = new fabric.Circle({
            ...shapeProps,
            radius: 50,
          });
          break;
        case 'triangle':
          shape = new fabric.Triangle({
            ...shapeProps,
            width: 100,
            height: 100,
          });
          break;
      }
      if (shape) {
        canvas.add(shape);
        canvas.bringToFront(shape);
        canvas.setActiveObject(shape);
        canvas.renderAll();
        setActiveTool(type);
        setShowDelete(true);
      }
    }
  };

  const deleteSelected = () => {
    if (canvas) {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        canvas.remove(activeObject);
        canvas.renderAll();
        setShowDelete(false);
      }
    }
  };

  const changeColor = (newColor) => {
    setColor(newColor);
    if (canvas) {
      const activeObject = canvas.getActiveObject();
      if (activeObject && activeObject.isShape) {
        activeObject.set('fill', newColor);
        canvas.renderAll();
      }
    }
  };

  const changeTextColor = (newColor) => {
    setTextColor(newColor);
    if (canvas) {
      const activeObject = canvas.getActiveObject();
      if (activeObject && activeObject.type === 'i-text') {
        activeObject.set('fill', newColor);
        canvas.renderAll();
      }
    }
  };

  const bringToFront = () => {
    if (canvas) {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        canvas.bringToFront(activeObject);
        canvas.renderAll();
      }
    }
  };

  const sendToBack = () => {
    if (canvas) {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        canvas.sendToBack(activeObject);
        // Make sure it stays above the background image
        const background = canvas.getObjects().find(obj => obj.name === 'backgroundImage');
        if (background) {
          canvas.sendToBack(background);
        }
        canvas.renderAll();
      }
    }
  };

// const downloadEditedImage = async () => {
//     if (canvas) {
//       try {
//         // Create a temporary canvas with the same dimensions
//         const tempCanvas = document.createElement('canvas');
//         tempCanvas.width = canvas.width;
//         tempCanvas.height = canvas.height;
//         const tempCtx = tempCanvas.getContext('2d');
        
//         // Fill with background gradient
//         const gradient = tempCtx.createLinearGradient(0, 0, 0, tempCanvas.height);
//         gradient.addColorStop(0, '#1a1a2e');
//         gradient.addColorStop(1, '#16213e');
//         tempCtx.fillStyle = gradient;
//         tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        
//         // First try to use toDataURL
//         try {
//           const dataURL = canvas.toDataURL({
//             format: 'png',
//             quality: 1.0,
//           });
          
//           const link = document.createElement('a');
//           link.download = `edited_image_${Date.now()}.png`;
//           link.href = dataURL;
//           document.body.appendChild(link);
//           link.click();
//           document.body.removeChild(link);
//         } catch (error) {
//           console.log('toDataURL failed, trying alternative method:', error);
          
//           // Alternative method using fabric's toDataURLWithMultiplier
//           const dataURL = canvas.toDataURLWithMultiplier('png', 1);
//           const link = document.createElement('a');
//           link.download = `edited_image_${Date.now()}.png`;
//           link.href = dataURL;
//           document.body.appendChild(link);
//           link.click();
//           document.body.removeChild(link);
//         }
        
//         setShowDownloadOptions(false);
//       } catch (error) {
//         console.error('Error downloading edited image:', error);
//         alert('Could not download image. Please try again or use a different browser.');
//       }
//     }
//   };


const downloadEditedImage = () => {
    if (!canvas) return;
  
    // Create a temporary canvas to draw our final image
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    // Use original image dimensions if available, otherwise use canvas dimensions
    const img = imageInstance?._element;
    const originalWidth = img?.naturalWidth || canvas.width;
    const originalHeight = img?.naturalHeight || canvas.height;
  
    // Set temp canvas dimensions
    tempCanvas.width = originalWidth;
    tempCanvas.height = originalHeight;
  
    // Fill with background color (optional)
    tempCtx.fillStyle = '#000000';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
  
    // Create a promise to handle the image export
    new Promise((resolve) => {
      // First try to export with background image
      canvas.clone(clonedCanvas => {
        // Scale cloned canvas to original image dimensions
        const scaleX = originalWidth / canvas.width;
        const scaleY = originalHeight / canvas.height;
        
        // Create a new canvas for the scaled version
        const scaledCanvas = document.createElement('canvas');
        scaledCanvas.width = originalWidth;
        scaledCanvas.height = originalHeight;
        const scaledCtx = scaledCanvas.getContext('2d');
        
        // Scale and draw the cloned canvas
        scaledCtx.scale(scaleX, scaleY);
        scaledCtx.drawImage(clonedCanvas.lowerCanvasEl, 0, 0);
        
        // Draw onto our final canvas
        tempCtx.drawImage(scaledCanvas, 0, 0);
        resolve();
      });
    }).catch(() => {
      // Fallback if clone fails (CORS issues)
      const scaleX = originalWidth / canvas.width;
      const scaleY = originalHeight / canvas.height;
      
      tempCtx.scale(scaleX, scaleY);
      tempCtx.drawImage(canvas.lowerCanvasEl, 0, 0);
    }).finally(() => {
      // Create download link
      const link = document.createElement('a');
      link.download = `design-${Date.now()}.png`;
      
      // Convert to data URL and download
      tempCanvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        link.href = url;
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, 100);
      }, 'image/png', 1.0);
    });
  };


const downloadOriginalImage = async () => {
    if (selectedImage) {
      try {
        // Fetch the image as a blob first to handle cross-origin issues
        const response = await fetch(selectedImage);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.download = `original_image_${Date.now()}.png`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the object URL after some time
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 100);
        
        setShowDownloadOptions(false);
      } catch (error) {
        console.error('Error downloading original image:', error);
        // Fallback method if fetch fails
        const link = document.createElement('a');
        link.download = `original_image_${Date.now()}.png`;
        link.href = selectedImage;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setShowDownloadOptions(false);
      }
    }
  };


  const handleResize = () => {
    if (canvas && canvasContainerRef.current) {
        const container = canvasContainerRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      canvas.setDimensions({
        // width: Math.min(800, window.innerWidth - 40),
        width: containerWidth,
        // height: Math.min(600, window.innerHeight - 200),
        height: containerHeight,
      });

      // Resize and reposition background image if exists
      const bgImage = canvas.getObjects().find(obj => obj.name === 'backgroundImage');
      if (bgImage) {
        const scale = Math.min(
          containerWidth / (bgImage.width / bgImage.scaleX),
          containerHeight / (bgImage.height / bgImage.scaleY)
        );
        
        const newScaleX = scale * (bgImage.scaleX || 1);
        const newScaleY = scale * (bgImage.scaleY || 1);
    
        const left = (containerWidth - (bgImage.width * newScaleX)) / 2;
        const top = (containerHeight - (bgImage.height * newScaleY)) / 2;
    
        bgImage.set({
          scaleX: newScaleX,
          scaleY: newScaleY,
          left: left,
          top: top
        });
      }
      canvas.renderAll();
    }
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [canvas]);

  return (
    <div className={styles.editorPage}>
      <div className={styles.editorContainer}>
        <button 
          className={styles.backButton} 
          onClick={() => navigate('/')}
        >
          <FaArrowLeft className={styles.backIcon} />
          <span>Back to Search</span>
        </button>
        
        <div className={styles.canvasWrapper}>
            <div className={styles.canvasContainer} ref={canvasContainerRef}>
                <canvas ref={canvasRef} />
            </div>
        </div>
        
        <div className={styles.toolbar}>
          <div className={styles.toolGroup}>
            <button 
              onClick={addText}
              className={`${styles.toolButton} ${activeTool === 'text' ? styles.active : ''}`}
            >
              <FaTextHeight className={styles.toolIcon} />
              <span>Add Text</span>
            </button>
            <button 
              onClick={() => addShape('rectangle')}
              className={`${styles.toolButton} ${activeTool === 'rectangle' ? styles.active : ''}`}
            >
              <FaSquare className={styles.toolIcon} />
              <span>Rectangle</span>
            </button>
            <button 
              onClick={() => addShape('circle')}
              className={`${styles.toolButton} ${activeTool === 'circle' ? styles.active : ''}`}
            >
              <FaCircle className={styles.toolIcon} />
              <span>Circle</span>
            </button>
            <button 
              onClick={() => addShape('triangle')}
              className={`${styles.toolButton} ${activeTool === 'triangle' ? styles.active : ''}`}
            >
              <MdChangeHistory className={styles.toolIcon} />
              <span>Triangle</span>
            </button>
          </div>
          
          <div className={styles.toolGroup}>
            <div className={styles.colorPicker}>
              <MdColorLens className={styles.colorIcon} />
              <span>Fill:</span>
              <input 
                type="color" 
                value={color} 
                onChange={(e) => changeColor(e.target.value)} 
              />
            </div>
            <div className={styles.colorPicker}>
              <MdColorLens className={styles.colorIcon} />
              <span>Text:</span>
              <input 
                type="color" 
                value={textColor} 
                onChange={(e) => changeTextColor(e.target.value)} 
              />
            </div>
            {showDelete && (
              <button 
                onClick={deleteSelected}
                className={`${styles.toolButton} ${styles.deleteButton}`}
              >
                <MdDelete className={styles.toolIcon} />
                <span>Delete</span>
              </button>
            )}
          </div>
          
          <div className={styles.toolGroup}>
            <button 
              onClick={bringToFront}
              className={styles.toolButton}
            >
              <FaLayerGroup className={styles.toolIcon} />
              <span>Bring Forward</span>
            </button>
            <button 
              onClick={sendToBack}
              className={styles.toolButton}
            >
              <MdOutlineLayers className={styles.toolIcon} />
              <span>Send Backward</span>
            </button>
            <div className={styles.downloadContainer}>
                <button 
                onClick={() => setShowDownloadOptions(!showDownloadOptions)}
                className={`${styles.toolButton} ${styles.downloadButton}`}
                >
                <FaDownload className={styles.toolIcon} />
                <span>Download</span>
                </button>
                {showDownloadOptions && (
                    <div className={styles.downloadOptions}>
                        <button 
                        onClick={downloadEditedImage}
                        className={styles.downloadOption}
                        >
                        <FaLayerGroup className={styles.toolIcon} />
                        <span>With Edits</span>
                        </button>
                        <button 
                        onClick={downloadOriginalImage}
                        className={styles.downloadOption}
                        >
                        <BiImageAlt className={styles.toolIcon} />
                        <span>Original</span>
                        </button>
                    </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditPage;