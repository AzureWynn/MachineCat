FROM osrf/ros:humble-desktop

ARG USE_CHINA_MIRROR=true

ENV DEBIAN_FRONTEND=noninteractive

RUN if [ "$USE_CHINA_MIRROR" = "true" ]; then \
      sed -i 's|http://archive.ubuntu.com|https://mirrors.tuna.tsinghua.edu.cn|g' /etc/apt/sources.list && \
      sed -i 's|http://security.ubuntu.com|https://mirrors.tuna.tsinghua.edu.cn|g' /etc/apt/sources.list && \
      sed -i 's|http://packages.ros.org|https://mirrors.tuna.tsinghua.edu.cn/ros|g' /etc/apt/sources.list.d/ros2.list; \
    fi && \
    apt-get update && apt-get install -y \
    ros-humble-gazebo-ros-pkgs \
    ros-humble-robot-state-publisher \
    ros-humble-joint-state-publisher \
    ros-humble-xacro \
    ros-humble-rosbridge-suite \
    tigervnc-standalone-server \
    tigervnc-common \
    supervisor \
    firefox \
    wget \
    curl \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

RUN if [ "$USE_CHINA_MIRROR" = "true" ]; then \
      pip3 config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple; \
    fi && \
    pip3 install setuptools

RUN mkdir -p /root/.vnc && \
    echo "robot" | vncpasswd -f > /root/.vnc/passwd && \
    chmod 600 /root/.vnc/passwd

COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

WORKDIR /ros2_ws

COPY src/ /ros2_ws/src/

RUN /bin/bash -c 'source /opt/ros/humble/setup.bash && colcon build'

RUN echo 'source /opt/ros/humble/setup.bash' >> /root/.bashrc && \
    echo 'source /ros2_ws/install/setup.bash' >> /root/.bashrc

EXPOSE 5901 6080 9090

CMD ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
